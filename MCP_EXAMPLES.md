# Supabase MCP Usage Examples

This file contains example commands and use cases for interacting with the MoneyManager database using Supabase MCP through AI assistants like Claude.

## Prerequisites

- MCP client installed and configured (see [MCP_SETUP.md](MCP_SETUP.md))
- Connected to your Supabase project or database
- Authenticated with appropriate permissions

## Example Queries

### Database Schema Exploration

**List all tables:**
```
Show me all the tables in my database
```

**Get table schema:**
```
What's the schema for the Transaction table?
```

**View relationships:**
```
Show me how the Ledger and Transaction tables are related
```

**Get index information:**
```
What indexes exist on the Transaction table?
```

### Data Queries

**View recent transactions:**
```
Show me the last 10 transactions ordered by date
```

**Analyze spending:**
```
What's the total spending by category for the current month?
```

**User statistics:**
```
How many users have access to shared ledgers?
```

**Activity logs:**
```
Show me the most recent activity log entries for ledger ID: xyz123
```

### Data Analysis

**Category insights:**
```
Which expense category has the most transactions?
```

**Monthly summary:**
```
Give me a breakdown of income vs expenses for January 2026
```

**User collaboration:**
```
List all ledgers and show who has access to each one
```

**Receipt usage:**
```
How many transactions have receipt images attached?
```

### Database Operations (if write access granted)

**Create a category:**
```
Create a new category:
- Name: "Travel"
- Type: "Expense"
- Icon: "✈️"
- Color: "#2196F3"
- LedgerId: "xyz123"
```

**Update a transaction:**
```
Update transaction ID abc456 to set the amount to 150.00
```

**Add a user to a ledger:**
```
Add user with username "john_doe" to ledger xyz123 with role "editor"
```

### Schema Information

**Get table count:**
```
How many tables are in the database?
```

**Foreign key relationships:**
```
Show me all foreign key relationships in the database
```

**Enum values:**
```
What are the valid values for the 'role' field in LedgerUser?
```

## Complex Analysis Examples

### Financial Insights

**Monthly comparison:**
```
Compare total expenses between December 2025 and January 2026
```

**Top spending categories:**
```
List the top 5 expense categories by total amount spent in the last 3 months
```

**Income sources:**
```
Break down income by category for the current year
```

### Collaboration Analytics

**Most active users:**
```
Which users have created the most transactions in the last month?
```

**Ledger sharing overview:**
```
Show me all shared ledgers with their owners and the number of shared users
```

**Activity timeline:**
```
Show me all activity logs for the past week, grouped by action type
```

### Data Quality Checks

**Find incomplete data:**
```
Find all transactions that don't have a note or receipt image
```

**Orphaned records:**
```
Are there any transactions that reference deleted categories?
```

**Duplicate detection:**
```
Find transactions with the same amount, description, and date
```

## Advanced Use Cases

### Migration Planning

**Schema comparison:**
```
Compare the current schema with Prisma schema definition in schema.prisma
```

**Data volume assessment:**
```
What's the total storage used by receipt images in the Transaction table?
```

### Performance Analysis

**Query optimization:**
```
Which queries would benefit from additional indexes based on the current schema?
```

**Table size analysis:**
```
How many records are in each table?
```

### Security Review

**Permission audit:**
```
List all users with 'owner' role across all ledgers
```

**Access patterns:**
```
Show me the distribution of user roles (owner, editor, viewer) across all ledgers
```

## Safety Notes

1. **Read-Only Mode**: For exploratory queries, always use read-only mode
2. **Confirm Changes**: Always review proposed changes before executing
3. **Backup First**: Before bulk operations, ensure you have backups
4. **Test in Dev**: Test complex operations in a development environment first
5. **Respect RLS**: Be aware of Row Level Security policies if implemented

## Integration with Development Workflow

### During Development

- "What fields does the Category model have?"
- "Show me example data from the Transaction table"
- "Help me understand the relationship between Ledger and LedgerUser"

### During Code Review

- "Does the database schema match the Prisma schema?"
- "Are there any missing indexes that could improve performance?"
- "What foreign key constraints exist?"

### During Debugging

- "Show me the last 5 failed login attempts"
- "Find transactions created in the last hour"
- "What's the current state of ledger xyz123?"

## Tips for Effective MCP Usage

1. **Be Specific**: Provide table names and field names when you know them
2. **Use Filters**: Narrow down queries with date ranges, limits, or conditions
3. **Request Formatting**: Ask for results in specific formats (table, JSON, summary)
4. **Iterate**: Start with broad queries, then drill down based on results
5. **Combine Queries**: You can ask multiple related questions at once

## Common Issues and Solutions

**Issue**: "Can't find table"
- Solution: Verify the table name is correct and matches the Prisma schema

**Issue**: "Permission denied"
- Solution: Check your Supabase role and ensure you have appropriate permissions

**Issue**: "Results too large"
- Solution: Add LIMIT clauses or filter by date ranges

**Issue**: "Connection timeout"
- Solution: Verify your internet connection and MCP server status

## Next Steps

After mastering basic queries:
1. Learn to create complex joins across multiple tables
2. Use aggregation functions for analytics
3. Explore transaction patterns for insights
4. Set up automated reporting queries
5. Integrate MCP queries into your development workflow

---

**Remember**: MCP is a powerful tool for database interaction. Always use it responsibly and follow security best practices!
