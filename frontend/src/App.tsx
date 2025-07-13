import "./App.css";
import { useTranslation } from "react-i18next";
import { ProductList } from "./components/ProductList";
import { LanguageSelector } from "./components/LanguageSelector";
import { CurrencySelector } from "./components/CurrencySelector";
import { CurrencyProvider } from "./hooks/useCurrency";

function App() {
  const { t } = useTranslation();

  return (
    <CurrencyProvider>
      <div
        id="App"
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Selectors */}
          <div className="flex justify-end gap-3 mb-4">
            <CurrencySelector />
            <LanguageSelector />
          </div>

          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("app.title")}
            </h1>
            <p className="text-slate-300 text-lg">{t("app.subtitle")}</p>
          </header>
          <ProductList />
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default App;
