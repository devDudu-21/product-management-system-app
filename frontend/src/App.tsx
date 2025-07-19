import "./App.css";
import { useTranslation } from "react-i18next";
import { ProductList } from "./components/ProductList";
import { LanguageSelector } from "./components/LanguageSelector";
import { CurrencySelector } from "./components/CurrencySelector";
import { CurrencyStatusIndicator } from "./components/CurrencyStatusIndicator";
import { CurrencyDebugPanel } from "./components/CurrencyDebugPanel";
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
          <div className="flex justify-between items-center mb-4">
            <CurrencyStatusIndicator compact />
            <div className="flex gap-3">
              <CurrencySelector />
              <LanguageSelector />
            </div>
          </div>

          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("app.title")}
            </h1>
            <p className="text-slate-300 text-lg">{t("app.subtitle")}</p>
          </header>
          <ProductList />
          <CurrencyDebugPanel />
        </div>
      </div>
    </CurrencyProvider>
  );
}

export default App;
