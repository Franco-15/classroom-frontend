import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loading message="Cargando..." />;
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/auth/login" />;
}
