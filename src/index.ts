#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { NodeSSH } from 'node-ssh';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  privateKeyPassphrase?: string;
}

// Environment variable configuration helper
function getEnvSSHConfig(): Partial<SSHConfig> {
  const config: Partial<SSHConfig> = {};
  
  if (process.env.UBUNTU_SSH_HOST) {
    config.host = process.env.UBUNTU_SSH_HOST;
  }
  
  if (process.env.UBUNTU_SSH_PORT) {
    config.port = parseInt(process.env.UBUNTU_SSH_PORT, 10);
  }
  
  if (process.env.UBUNTU_SSH_USERNAME) {
    config.username = process.env.UBUNTU_SSH_USERNAME;
  }
  
  if (process.env.UBUNTU_SSH_PASSWORD) {
    config.password = process.env.UBUNTU_SSH_PASSWORD;
  }
  
  if (process.env.UBUNTU_SSH_PRIVATE_KEY_PATH) {
    try {
      config.privateKey = fs.readFileSync(process.env.UBUNTU_SSH_PRIVATE_KEY_PATH, 'utf8');
    } catch (error) {
      console.error(`Failed to read private key: ${error}`);
    }
  }
  
  if (process.env.UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE) {
    config.privateKeyPassphrase = process.env.UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE;
  }
  
  return config;
}

class VirtualBoxUbuntuServer {
  private server: Server;
  private ssh: NodeSSH;
  private config: SSHConfig | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'ssh-mcp-server',
        version: '1.0.0',
      }
    );

    this.ssh = new NodeSSH();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'connect_ssh',
            description: 'Connect to Ubuntu VM via SSH. Uses environment variables as defaults if parameters are not provided.',
            inputSchema: {
              type: 'object',
              properties: {
                host: {
                  type: 'string',
                  description: 'SSH host address (e.g., 192.168.1.100). Uses UBUNTU_SSH_HOST env var if not provided.',
                },
                port: {
                  type: 'number',
                  description: 'SSH port (default: 22). Uses UBUNTU_SSH_PORT env var if not provided.',
                  default: 22,
                },
                username: {
                  type: 'string',
                  description: 'SSH username. Uses UBUNTU_SSH_USERNAME env var if not provided.',
                },
                password: {
                  type: 'string',
                  description: 'SSH password (optional if using private key). Uses UBUNTU_SSH_PASSWORD env var if not provided.',
                },
                privateKey: {
                  type: 'string',
                  description: 'Private key content (optional). Uses UBUNTU_SSH_PRIVATE_KEY_PATH env var to read file if not provided.',
                },
                privateKeyPassphrase: {
                  type: 'string',
                  description: 'Private key passphrase (optional). Uses UBUNTU_SSH_PRIVATE_KEY_PASSPHRASE env var if not provided.',
                },
              },
              required: [],
            },
          },
          {
            name: 'connect_ssh_env',
            description: 'Connect to Ubuntu VM via SSH using only environment variables',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'execute_command',
            description: 'Execute a command on the connected Ubuntu VM',
            inputSchema: {
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  description: 'Command to execute on the Ubuntu VM',
                },
                cwd: {
                  type: 'string',
                  description: 'Working directory for the command (optional)',
                },
              },
              required: ['command'],
            },
          },
          {
            name: 'upload_file',
            description: 'Upload a file to the Ubuntu VM',
            inputSchema: {
              type: 'object',
              properties: {
                localPath: {
                  type: 'string',
                  description: 'Local file path',
                },
                remotePath: {
                  type: 'string',
                  description: 'Remote file path on Ubuntu VM',
                },
              },
              required: ['localPath', 'remotePath'],
            },
          },
          {
            name: 'download_file',
            description: 'Download a file from the Ubuntu VM',
            inputSchema: {
              type: 'object',
              properties: {
                remotePath: {
                  type: 'string',
                  description: 'Remote file path on Ubuntu VM',
                },
                localPath: {
                  type: 'string',
                  description: 'Local file path',
                },
              },
              required: ['remotePath', 'localPath'],
            },
          },
          {
            name: 'disconnect_ssh',
            description: 'Disconnect from the Ubuntu VM',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_system_info',
            description: 'Get system information from the Ubuntu VM',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'connect_ssh':
            return await this.connectSSH(args as any);
          case 'connect_ssh_env':
            return await this.connectSSH({});
          case 'execute_command':
            return await this.executeCommand(args as any);
          case 'upload_file':
            return await this.uploadFile(args as any);
          case 'download_file':
            return await this.downloadFile(args as any);
          case 'disconnect_ssh':
            return await this.disconnectSSH();
          case 'get_system_info':
            return await this.getSystemInfo();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async connectSSH(args: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    privateKey?: string;
    privateKeyPassphrase?: string;
  }) {
    try {
      // Get configuration from environment variables as defaults
      const envConfig = getEnvSSHConfig();
      
      // Merge provided arguments with environment defaults
      const finalConfig: SSHConfig = {
        host: args.host || envConfig.host || '',
        port: args.port || envConfig.port || 22,
        username: args.username || envConfig.username || '',
        password: args.password || envConfig.password,
        privateKey: args.privateKey || envConfig.privateKey,
        privateKeyPassphrase: args.privateKeyPassphrase || envConfig.privateKeyPassphrase,
      };

      // Validate required fields
      if (!finalConfig.host) {
        throw new Error('Host is required. Provide it as parameter or set UBUNTU_SSH_HOST environment variable.');
      }
      if (!finalConfig.username) {
        throw new Error('Username is required. Provide it as parameter or set UBUNTU_SSH_USERNAME environment variable.');
      }
      if (!finalConfig.password && !finalConfig.privateKey) {
        throw new Error('Either password or private key is required. Set UBUNTU_SSH_PASSWORD or UBUNTU_SSH_PRIVATE_KEY_PATH environment variable.');
      }

      this.config = finalConfig;
      await this.ssh.connect(this.config);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully connected to ${finalConfig.username}@${finalConfig.host}:${finalConfig.port}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`SSH connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async executeCommand(args: { command: string; cwd?: string }) {
    if (!this.ssh.isConnected()) {
      throw new Error('Not connected to SSH. Please connect first.');
    }

    try {
      const options = args.cwd ? { cwd: args.cwd } : {};
      const result = await this.ssh.execCommand(args.command, options);

      return {
        content: [
          {
            type: 'text',
            text: `Command: ${args.command}\nExit Code: ${result.code}\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Command execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async uploadFile(args: { localPath: string; remotePath: string }) {
    if (!this.ssh.isConnected()) {
      throw new Error('Not connected to SSH. Please connect first.');
    }

    try {
      await this.ssh.putFile(args.localPath, args.remotePath);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully uploaded ${args.localPath} to ${args.remotePath}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async downloadFile(args: { remotePath: string; localPath: string }) {
    if (!this.ssh.isConnected()) {
      throw new Error('Not connected to SSH. Please connect first.');
    }

    try {
      await this.ssh.getFile(args.localPath, args.remotePath);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully downloaded ${args.remotePath} to ${args.localPath}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`File download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async disconnectSSH() {
    try {
      this.ssh.dispose();
      this.config = null;

      return {
        content: [
          {
            type: 'text',
            text: 'Successfully disconnected from SSH',
          },
        ],
      };
    } catch (error) {
      throw new Error(`Disconnect failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getSystemInfo() {
    if (!this.ssh.isConnected()) {
      throw new Error('Not connected to SSH. Please connect first.');
    }

    try {
      const commands = [
        'uname -a',
        'lsb_release -a',
        'df -h',
        'free -h',
        'ps aux | head -10',
      ];

      let output = '';
      for (const command of commands) {
        const result = await this.ssh.execCommand(command);
        output += `=== ${command} ===\n${result.stdout}\n\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: output,
          },
        ],
      };
    } catch (error) {
      throw new Error(`System info failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('VirtualBox Ubuntu MCP Server running on stdio');
  }
}

const server = new VirtualBoxUbuntuServer();
server.run().catch(console.error);
