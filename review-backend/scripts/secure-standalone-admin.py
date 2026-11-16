"""Initialize only QC Core's new instance admin password; never print secrets.

Run once after instance creation. No SQL queries or reviewer records are involved.
The password is persisted in Secret Manager before applying it to the new instance.
"""
import base64
import json
import secrets
import subprocess
import time
import urllib.error
import urllib.request

PROJECT = 'apl-qc-core-app-f5a3e'
INSTANCE = 'qc-core-db'
SECRET = 'qc-core-db-admin'
token = subprocess.run(['gcloud.cmd', 'auth', 'print-access-token'], capture_output=True, text=True, check=True).stdout.strip()


def request(method, url, payload=None):
    req = urllib.request.Request(url, data=None if payload is None else json.dumps(payload).encode(),
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Never print request/response bodies containing credential material.
        raise RuntimeError('Cloud setup request rejected with HTTP ' + str(error.code)) from None


sql = 'https://sqladmin.googleapis.com/sql/v1beta4/projects/' + PROJECT
instance = request('GET', sql + '/instances/' + INSTANCE)
if instance.get('state') != 'RUNNABLE':
    raise RuntimeError('QC Core instance must be RUNNABLE before admin initialization.')
if instance.get('settings', {}).get('connectorEnforcement') != 'REQUIRED':
    raise RuntimeError('Refusing initialization without connector enforcement.')

secret_api = 'https://secretmanager.googleapis.com/v1/projects/' + PROJECT + '/secrets'
# Creating an existing secret fails instead of silently rotating an existing admin.
request('POST', secret_api + '?secretId=' + SECRET, {'replication': {'automatic': {}}, 'labels': {'app': 'qc-core', 'purpose': 'database-admin'}})
password = secrets.token_urlsafe(36)
version = request('POST', secret_api + '/' + SECRET + ':addVersion', {'payload': {'data': base64.b64encode(password.encode()).decode()}})
operation = request('PUT', sql + '/instances/' + INSTANCE + '/users?name=postgres', {'name': 'postgres', 'password': password})
password = None
print(json.dumps({'adminSecretVersion': version['name'], 'passwordUpdateOperation': operation['name'], 'passwordDisplayed': False}))
for _ in range(60):
    result = request('GET', sql + '/operations/' + operation['name'])
    if result.get('status') == 'DONE':
        if result.get('error'):
            raise RuntimeError('Admin initialization failed; inspect operation metadata without displaying secret contents.')
        print('PASS standalone admin password initialized; stored only in QC Core Secret Manager. No runtime access granted.')
        break
    time.sleep(1)
else:
    raise RuntimeError('Password operation still pending; check the recorded operation before retrying. Do not create another secret.')
