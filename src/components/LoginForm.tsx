import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import MiniCalendar from './MiniCalendar';

const LoginForm = () => {
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast({
        title: 'Success',
        description: 'Login successful',
      });
    } else {
      toast({
        title: 'Error',
        description: t('invalidPassword'),
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* MiniCalendar shown above the login card */}
      <div className="mb-6">
        <MiniCalendar />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-2xl font-bold text-blue-600">HMS</h1>
          </div>
          <CardTitle className="text-xl">{t('loginRequired')}</CardTitle>
          <div className="flex items-center justify-center space-x-2">
            <span className={language === 'en' ? 'font-semibold' : ''}>EN</span>
            <Switch
              checked={language === 'km'}
              onCheckedChange={(checked) => setLanguage(checked ? 'km' : 'en')}
            />
            <span className={language === 'km' ? 'font-semibold' : ''}>ខ្មែរ</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              {t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
