import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useLanguage } from '../store/languageStore';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(t('common.errorOccurred'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-accent rounded-xl mb-4">
            <Building2 size={32} className="text-primary-bg" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-text">{t('common.techWarehouse')}</h1>
          <p className="text-primary-text-muted mt-1">{t('common.hrManagement')}</p>
        </div>

        <div className="card p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-primary-text mb-6 text-center">{t('common.welcome')}</h2>

          {error && (
            <div className="mb-4 p-3 bg-primary-danger/10 border border-primary-danger/20 rounded-lg text-primary-danger text-sm flex items-center gap-2" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-1.5">
                {t('common.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input w-full"
                placeholder="hr@techwarehouse.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-text mb-1.5">
                {t('common.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input w-full pr-12"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-text-muted hover:text-primary-text transition-colors"
                  aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-primary-border text-primary-accent focus:ring-primary-accent bg-primary-bg"
                />
                <span className="text-sm text-primary-text-muted">{t('common.rememberMe')}</span>
              </label>
              <a href="#" className="text-sm text-primary-accent hover:text-primary-accent/80">
                {t('common.forgotPassword')}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  {t('common.loading')}
                </span>
              ) : (
                t('common.login')
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary-border">
            <p className="text-sm text-primary-text-muted text-center mb-4">{t('common.demoAccounts')}</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail('hr@techwarehouse.com'); setPassword('hr1234'); }}
                className="btn btn-secondary w-full text-left justify-start"
                disabled={loading}
              >
                <span className="font-mono text-xs bg-primary-bg px-2 py-0.5 rounded mr-2">hr@techwarehouse.com</span>
                <span>HR / hr1234</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('ceo@techwarehouse.com'); setPassword('ceo1234'); }}
                className="btn btn-secondary w-full text-left justify-start"
                disabled={loading}
              >
                <span className="font-mono text-xs bg-primary-bg px-2 py-0.5 rounded mr-2">ceo@techwarehouse.com</span>
                <span>CEO / ceo1234</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setLanguage('th')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                language === 'th'
                  ? 'bg-primary-accent text-primary-bg'
                  : 'bg-primary-hover text-primary-text'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-primary-accent text-primary-bg'
                  : 'bg-primary-hover text-primary-text'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;