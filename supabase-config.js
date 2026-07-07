import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://qmyrxvtbzlbnvzxypnus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXJ4dnRiemxibnZ6eHlwbnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjA4OTcsImV4cCI6MjA5NTM5Njg5N30.ABvW_oBzXC2Ffxm5ToLh6t4WmdKPdtg9SyfeAE76iJo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Listen for auth state changes (e.g. after OAuth redirect)
supabase.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        const user = session.user;
        const userEmail = user.email?.toLowerCase() || '';

        // Query the users table to get the REAL role and existing profile from the database
        let role = 'student'; // Default
        let existingProfile = null;
        try {
            // Check profiles table for user role, name, and avatar
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', userEmail)
                .single();
            if (profile) {
                role = profile.role || 'student';
                existingProfile = profile;
            }
        } catch (err) {
            // User not found in users table — default to student
        }

        const profileName = existingProfile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const profileAvatar = existingProfile?.avatar_url || user.user_metadata?.avatar_url || null;

        // Auto-sync profile on first login (upsert so no duplicates)
        try {
            await supabase.from('profiles').upsert({
                email: userEmail,
                name: profileName,
                role: role,
                auth_id: user.id,
                avatar_url: profileAvatar
            }, { onConflict: 'email', ignoreDuplicates: false });
        } catch (err) {
            // Profile sync failed silently — chat will still work
        }

        const edtechUser = {
            uid: user.id,
            email: userEmail,
            name: profileName,
            role: role,
            avatar_url: profileAvatar
        };
        localStorage.setItem('edtech_user', JSON.stringify(edtechUser));
        
        // Save to global portal variables so ThemeContext picks them up!
        localStorage.setItem('portal_name', profileName);
        if (profileAvatar) localStorage.setItem('portal_avatar', profileAvatar);
        let designation = 'Student';
        if (role === 'admin') designation = 'Administrator';
        else if (role === 'teacher') designation = 'Teacher';
        localStorage.setItem('portal_designation', designation);

        // Determine target portal based on DB role
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const basePath = isLocal ? '' : '/Working-Platform';

        let targetPortal = '/student/';
        if (role === 'admin') targetPortal = '/admin/';
        else if (role === 'teacher') targetPortal = '/teacher/';

        const isOnLoginPage = window.location.pathname.includes('login.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/Working-Platform/') ||
            window.location.pathname.endsWith('Landing Page/');

        if (isOnLoginPage) {
            window.location.href = window.location.origin + basePath + targetPortal;
        }
    }
});

export const signInWithGoogle = async () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    const basePath = isLocal ? '' : '/Working-Platform';
    const redirectUrl = window.location.origin + basePath + '/login.html';

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl
        }
    });

    if (error) {
        console.error('Error signing in with Google:', error.message);
        alert('Login failed: ' + error.message);
    }
};
