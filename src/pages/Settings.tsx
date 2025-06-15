
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const ADMIN_KEY = "hms-admin-profile";
const BACKUP_KEY = "hms-backup";
const AUTH_TOKEN_KEY = "hms-auth-token";

function saveAdminProfile(name: string, password: string) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ name, password }));
}

function getAdminProfile() {
  const profile = localStorage.getItem(ADMIN_KEY);
  if (profile) {
    const { name, password } = JSON.parse(profile);
    return { name, password };
  }
  // Default admin
  return { name: "Admin", password: "5569" };
}

function getTokenExpiry() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    const { timestamp } = JSON.parse(token);
    const ms = 24 * 3600 * 1000 - (Date.now() - timestamp);
    if (ms > 0) {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      return `${hours}h ${minutes}m ${seconds}s`;
    }
  }
  return "Expired";
}

const Settings: React.FC = () => {
  // Profile State
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [cpwVisible, setCpwVisible] = useState(false);
  // Token State
  const [expiry, setExpiry] = useState(getTokenExpiry());
  // Backup State
  const [backupText, setBackupText] = useState("");
  // Language
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const { name, password } = getAdminProfile();
    setName(name);
    setPassword(password);
    setConfirmPassword(password);
    const interval = setInterval(() => setExpiry(getTokenExpiry()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Profile Save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("error"), description: t("passwordsDontMatch") || "Passwords do not match.", variant: "destructive" });
      return;
    }
    saveAdminProfile(name, password);
    toast({ title: t("profile"), description: t("adminInfoSaved") || "Admin information saved." });
  };

  // Backup: Export all HMS keys
  const handleBackup = () => {
    const keys = [
      "hms-patients",
      "hms-doctors",
      "hms-medications",
      "hms-appointments",
      ADMIN_KEY,
      AUTH_TOKEN_KEY,
    ];
    const backup: Record<string, string | null> = {};
    keys.forEach((key) => (backup[key] = localStorage.getItem(key)));
    setBackupText(JSON.stringify(backup, null, 2));
    toast({ title: t("backupReady"), description: t("dataExported") || "Data exported to the textbox below." });
  };

  // Restore backup from textarea
  const handleRestore = () => {
    try {
      const data = JSON.parse(backupText);
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "string" && value) {
          localStorage.setItem(key, value);
        }
      });
      toast({ title: t("restoreComplete"), description: t("backupRestored") || "Backup restored from text." });
    } catch (e) {
      toast({ title: t("restoreFailed"), description: t("invalidBackupFormat") || "Invalid backup format.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings")}</h1>
      {/* Language Dropdown at the top right of TabsList */}
      <div className="flex justify-between items-center mb-2">
        <TabsList>
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="token">{t("token")}</TabsTrigger>
          <TabsTrigger value="backup">{t("backup")}</TabsTrigger>
        </TabsList>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">{t("language")}</span>
          <Select value={language} onValueChange={v => setLanguage(v as 'en' | 'km')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="km">ខ្មែរ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        {/* Profile Tab */}
        <TabsContent value="profile">
          <form className="space-y-4 mt-4" onSubmit={handleProfileSave}>
            <div>
              <label className="block text-sm font-medium mb-1">{t("adminName")}</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">{t("password")}</label>
              <Input
                type={pwVisible ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="max-w-xs pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                onClick={() => setPwVisible(v => !v)}
                title={pwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                aria-label={pwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <Eye size={20} />
              </button>
            </div>
            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">{t("confirmPassword") || "Confirm Password"}</label>
              <Input
                type={cpwVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="max-w-xs pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                onClick={() => setCpwVisible(v => !v)}
                title={cpwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                aria-label={cpwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <Eye size={20} />
              </button>
            </div>
            <Button type="submit" className="mt-2">{t("save")}</Button>
          </form>
        </TabsContent>
        {/* Token Tab */}
        <TabsContent value="token">
          <div className="mt-4">
            <h2 className="text-base font-medium mb-2">{t("authToken")}</h2>
            <div className="flex items-center gap-3">
              <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {t("expiresIn")}:
              </span>
              <span className="font-mono text-base">{expiry}</span>
            </div>
            <p className="mt-2 text-muted-foreground text-sm">{t("reloginToReset")}</p>
          </div>
        </TabsContent>
        {/* Backup Tab */}
        <TabsContent value="backup">
          <div className="mt-4 flex flex-col gap-2">
            <Button type="button" onClick={handleBackup} size="sm">
              {t("exportData")}
            </Button>
            <textarea
              className="w-full h-36 border rounded p-2 text-xs font-mono bg-gray-50"
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              placeholder="Backup JSON will appear here"
            />
            <Button type="button" onClick={handleRestore} size="sm" variant="outline">
              {t("restoreData")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
