import { authOptions } from '../src/lib/auth';

async function testAuth() {
    console.log('🧪 Testing Auth Authorize...');
    const credentials = {
        email: 'superadmin@sudaksha.com',
        password: 'password123'
    };

    try {
        // @ts-ignore - access authorize directly
        const user = await authOptions.providers[0].authorize(credentials, {} as any);
        if (user) {
            console.log('✅ Auth SUCCESS:', JSON.stringify(user, null, 2));
        } else {
            console.log('❌ Auth FAILED: authorize returned null');
        }
    } catch (error: any) {
        console.error('❌ Auth ERROR:', error.message);
    }
}

testAuth();
