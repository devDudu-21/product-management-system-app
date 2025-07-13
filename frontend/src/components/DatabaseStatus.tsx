import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GetDatabaseStatus,
  RetryDatabaseConnection,
} from "../../wailsjs/go/main/App";
import { Button } from "./ui/button";

interface DatabaseStatus {
  healthy: boolean;
  error: string;
}

interface DatabaseStatusProps {
  onStatusChange?: (healthy: boolean) => void;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({
  onStatusChange,
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<DatabaseStatus>({
    healthy: true,
    error: "",
  });
  const [isRetrying, setIsRetrying] = useState(false);

  const checkStatus = async () => {
    try {
      const result = await GetDatabaseStatus();
      const newStatus = {
        healthy: result.healthy as boolean,
        error: (result.error as string) || "",
      };
      setStatus(newStatus);
      onStatusChange?.(newStatus.healthy);
    } catch (error) {
      console.error("Erro ao verificar status do banco:", error);
      const errorStatus = { healthy: false, error: "Erro ao verificar status" };
      setStatus(errorStatus);
      onStatusChange?.(false);
    }
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    try {
      const result = await RetryDatabaseConnection();
      if (result.success) {
        await checkStatus();
      }
    } catch (error) {
      console.error("Erro ao tentar reconectar:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (status.healthy) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>{t("database.connected")}</span>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="font-medium">{t("database.disconnected")}</span>
      </div>

      {status.error && (
        <p className="text-red-700 text-sm mb-3">{status.error}</p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={retryConnection}
          disabled={isRetrying}
          size="sm"
          variant="outline"
        >
          {isRetrying ? t("database.retrying") : t("database.retryConnection")}
        </Button>

        <Button onClick={checkStatus} size="sm" variant="ghost">
          {t("database.checkStatus")}
        </Button>
      </div>
    </div>
  );
};
