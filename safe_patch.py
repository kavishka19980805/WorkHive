import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Add header to existing headers objects (since almost all fetches with options have headers)
    # We look for "headers: {" and replace with "headers: { 'ngrok-skip-browser-warning': 'true',"
    # Wait, what if there are headers that are not for fetch? Yes, but adding this header doesn't hurt.
    content = re.sub(r'headers:\s*\{', r"headers: { 'ngrok-skip-browser-warning': 'true', ", content)

    # 2. Add options object to fetches that have NO options object.
    # Like: await fetch(`${backendUrl}/jobs?status=active`);
    # Or: await fetch(`${backendUrl}/jobs/${jobId}`);
    # Regex for await fetch( <string literal or template literal> );
    content = re.sub(r'await\s+fetch\(([`\'"][^,()]+[`\'"])\);', r"await fetch(\1, { headers: { 'ngrok-skip-browser-warning': 'true' } });", content)

    # What if they don't end in semicolon?
    # Like: await fetch(`${backendUrl}/jobs/${jobId}`)
    content = re.sub(r'await\s+fetch\(([`\'"][^,()]+[`\'"])\)', r"await fetch(\1, { headers: { 'ngrok-skip-browser-warning': 'true' } })", content)

    # Let's fix the duplicate issue in case the regex ran twice (just in case)
    content = content.replace("'ngrok-skip-browser-warning': 'true', 'ngrok-skip-browser-warning': 'true', ", "'ngrok-skip-browser-warning': 'true', ")

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for root, _, files in os.walk('./frontend/src/app'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))

