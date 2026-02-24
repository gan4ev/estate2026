import json

def escape(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    return "'" + str(val).replace("'", "''") + "'"

with open('/Users/max/.gemini/antigravity/brain/01ef3e63-a6d3-44d4-b5a5-b52d1575e4fc/.system_generated/steps/2568/output.txt', 'r') as f:
    data = json.load(f)

sql_commands = [
    "PRAGMA foreign_keys = OFF;",
]

tables = ["listings", "listing_i18n", "countries", "cities", "areas", "location_i18n", "media", "listing_extras"]

for table in tables:
    sql_commands.append(f"DELETE FROM {table};")
    rows = data.get(table, [])
    if not rows:
        continue
    
    cols = list(rows[0].keys())
    for row in rows:
        vals = [escape(row.get(c)) for c in cols]
        sql_commands.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)});")

sql_commands.append("PRAGMA foreign_keys = ON;")

with open('/Volumes/Archive/estate2026/database/migrations/sync_production.sql', 'w') as f:
    f.write('\n'.join(sql_commands))
