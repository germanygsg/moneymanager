# Supabase MCP Integration Guide

This project is configured to work with Supabase's Model Context Protocol (MCP) server, allowing AI assistants like Claude to interact directly with your database and backend services.

## What is Supabase MCP?

Supabase MCP enables AI assistants to:
- Query and manage your database using natural language
- Perform CRUD operations on tables
- Manage authentication and user permissions
- Work with edge functions
- Access project documentation and schema information

All through secure, natural language instructions rather than manual code or API calls.

## Setup Instructions

### 1. Configuration File

The project includes `mcp.json` which configures the Supabase MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

### 2. IDE/Client Setup

#### For Claude Desktop:

1. **Locate your Claude Desktop config file:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/claude/claude_desktop_config.json`

2. **Add the Supabase MCP server:**
   ```json
   {
     "mcpServers": {
       "supabase": {
         "type": "http",
         "url": "https://mcp.supabase.com/mcp"
       }
     }
   }
   ```

3. **Restart Claude Desktop**

#### For VS Code/Cursor:

1. Open your IDE settings
2. Navigate to MCP or AI integration settings
3. Add the MCP server configuration from `mcp.json`
4. Restart your IDE

### 3. Authentication

When you first connect to the Supabase MCP server:

1. You'll be prompted to authenticate via OAuth
2. Log in to your Supabase account
3. Select your organization
4. Authorize access to your project(s)

No personal access token (PAT) is required for normal use.

### 4. Optional: Scoped Configuration

For enhanced security, you can scope the MCP server to specific projects or features:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true&features=database,docs"
    }
  }
}
```

**Query Parameters:**
- `project_ref`: Scope to a specific Supabase project
- `read_only=true`: Enable read-only mode for safety
- `features`: Comma-separated list (database, auth, storage, docs, migrations)

### 5. Using MCP with This Project

Once configured, you can use natural language with your AI assistant:

**Example Commands:**

- "List all tables in my database"
- "Show me the schema for the Transaction table"
- "Query all transactions from the last month"
- "Create a new category with name 'Travel' and type 'Expense'"
- "Show me users who have access to this ledger"
- "Explain how authentication works in this project"

## Database Schema

The project uses the following main tables:
- **User**: Authentication and user preferences
- **Ledger**: Financial workspaces
- **LedgerUser**: Ledger sharing and permissions
- **Category**: Income/Expense categories
- **Transaction**: Financial transactions
- **ActivityLog**: Audit trail

See `prisma/schema.prisma` for complete schema details.

## Security Best Practices

1. **Use Read-Only Mode**: For exploratory operations, enable `read_only=true`
2. **Project Scoping**: Always scope to your specific project when possible
3. **Feature Limitations**: Restrict features to only what you need
4. **Review Actions**: Always review proposed database operations before confirming
5. **Regular Audits**: Check access logs in your Supabase dashboard

## Current Database Configuration

This project currently uses PostgreSQL (via Vercel Postgres) with Prisma ORM. The database connection is configured through environment variables:

```env
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

### Migrating to Supabase (Optional)

If you want to migrate from Vercel Postgres to Supabase:

1. Create a new Supabase project
2. Export your current database schema and data
3. Import into Supabase
4. Update environment variables to point to Supabase
5. Use MCP for enhanced AI-powered database operations

## Troubleshooting

### Connection Issues

**Problem**: Can't connect to Supabase MCP
- Verify your IDE/client supports MCP
- Check that the config file is in the correct location
- Restart your IDE/client after adding configuration
- Ensure you have a stable internet connection

**Problem**: Authentication fails
- Clear browser cookies and try again
- Verify you have access to the Supabase organization
- Check that your Supabase account is active

### Permission Issues

**Problem**: MCP can't access certain features
- Verify your Supabase role has appropriate permissions
- Check project-level access settings
- Review Row Level Security (RLS) policies if applicable

## Additional Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [Project README](./README.md)
- [Database Schema Documentation](./schema.md)

## Support

For issues specific to:
- **MCP Integration**: Check Supabase documentation or GitHub issues
- **This Project**: See project README or open an issue
- **Database Issues**: Review Prisma documentation

---

**Note**: MCP integration is optional and doesn't affect the core functionality of the application. The app works perfectly fine without MCP - it simply provides an additional layer of AI-powered database interaction for development and administration tasks.
