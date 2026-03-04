const fs = require('fs');

const updatePackage = (path, newName) => {
    if (!fs.existsSync(path)) return;
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data.name = newName;
    data.dependencies = data.dependencies || {};
    data.dependencies['@sudaksha/db-core'] = 'workspace:*';
    data.dependencies['@sudaksha/db-assessments'] = 'workspace:*';
    data.dependencies['@sudaksha/types'] = 'workspace:*';
    data.dependencies['@sudaksha/sso-auth'] = 'workspace:*';
    data.dependencies['@sudaksha/ui'] = 'workspace:*';

    if (newName === '@sudaksha/website') {
        data.scripts.dev = 'next dev --port 3000';
    } else if (newName === '@sudaksha/portal') {
        data.scripts.dev = 'next dev --port 3001';
    }

    fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

updatePackage('./sudaksha-platform/apps/website/package.json', '@sudaksha/website');
updatePackage('./sudaksha-platform/apps/portal/package.json', '@sudaksha/portal');
