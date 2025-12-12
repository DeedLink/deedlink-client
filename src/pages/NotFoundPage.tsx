import { useLanguage } from "../contexts/LanguageContext";

const NotFoundPage=() => {
    const { t } = useLanguage();
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">{t('page_not_found_message')}</p>
        <a
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {t('go_home')}
        </a>
      </div>
    );
  };
  
  export default NotFoundPage;