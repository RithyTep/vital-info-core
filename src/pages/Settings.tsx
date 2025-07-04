"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Eye } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { generateFakeData, storeFakeDataToLocalStorage } from "@/utils/fakeDataUtils"
import { hashPassword } from "@/utils/hashUtils"

const ADMIN_KEY = "hms-admin-profile"
const BACKUP_KEY = "hms-backup"
const AUTH_TOKEN_KEY = "hms-auth-token"

function saveAdminProfile(name: string, password: string) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ name, password }));
}

function getAdminProfile() {
  const profile = localStorage.getItem(ADMIN_KEY);
  if (profile) {
    const { name, password } = JSON.parse(profile);
    return { name, password };
  }
  return { name: "Admin", password: "5569" };
}

function getTokenExpiry() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    const { timestamp } = JSON.parse(token)
    const ms = 24 * 3600 * 1000 - (Date.now() - timestamp)
    if (ms > 0) {
      const hours = Math.floor(ms / 3600000)
      const minutes = Math.floor((ms % 3600000) / 60000)
      const seconds = Math.floor((ms % 60000) / 1000)
      return `${hours}h ${minutes}m ${seconds}s`
    }
  }
  return "Expired"
}

const Settings: React.FC = () => {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwVisible, setPwVisible] = useState(false)
  const [cpwVisible, setCpwVisible] = useState(false)
  const [exchangeRate, setExchangeRate] = useState("")
  const [expiry, setExpiry] = useState(getTokenExpiry())
  const [backupText, setBackupText] = useState("")
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const { name, password } = getAdminProfile()
    setName(name)
    setPassword("")
    setConfirmPassword("")

    const settings = localStorage.getItem("hms-settings")
    if (settings) {
      const parsed = JSON.parse(settings)
      setExchangeRate(parsed.exchangeRate?.toString() || "4000")
    } else {
      setExchangeRate("4000")
    }

    const interval = setInterval(() => setExpiry(getTokenExpiry()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("error"), description: t("passwordsDontMatch") || "Passwords do not match.", variant: "destructive" });
      return;
    }
    const settings = {
      exchangeRate: Number.parseFloat(exchangeRate) || 4000,
    }
    localStorage.setItem("hms-settings", JSON.stringify(settings))
    saveAdminProfile(name, password);
    toast({ title: t("profile"), description: t("adminInfoSaved") || "Admin information saved." });
  };

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
    keys.forEach((key) => {
      let value = localStorage.getItem(key);
      if (value && ["hms-patients", "hms-doctors", "hms-medications", "hms-appointments"].includes(key)) {
        try {
          const arr = JSON.parse(value);
          if (Array.isArray(arr)) {
            value = JSON.stringify(arr.map(item => {
              const { image, imageUrl, profilePicture, ...rest } = item;
              return rest;
            }));
          }
        } catch {
          console.error(`Failed to parse ${key}:`, value);
        }
      }
      if (key === ADMIN_KEY && value) {
        try {
          const obj = JSON.parse(value);
          if (obj && typeof obj === 'object') {
            delete obj.password;
            value = JSON.stringify(obj);
          }
        } catch {
        }
      }
      backup[key] = value;
    });
    setBackupText(JSON.stringify(backup, null, 2));
    toast({ title: t("backupReady"), description: t("dataExported") || "Data exported to the textbox below." });
  };

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
  }
  function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key);
        if (value) total += key.length + value.length;
      }
    }
    const bytes = total;
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    return { bytes, kb, mb, gb };
  }
  const size = getLocalStorageSize();
  const generateAndStoreFakeData = () => {
    const data = generateFakeData();
    storeFakeDataToLocalStorage(data);
    toast({ title: t("fakeDataGenerated") || "Fake data generated!", description: t("fakeDataDesc") || "100 records for each entity have been added." })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("settings")}</h1>
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
            <TabsTrigger value="token">{t("token")}</TabsTrigger>
            <TabsTrigger value="backup">{t("backup")}</TabsTrigger>
          </TabsList>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">{t("language")}</span>
            <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "km")}>
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
        <div className="mb-4 flex justify-end text-xs text-gray-500">
          <span>
            {t("localStorageUsage") || "LocalStorage Usage"}: {size.mb.toFixed(2)} MB
          </span>
        </div>
        <div className="mb-4 flex justify-end">
          <Button type="button" variant="outline" onClick={generateAndStoreFakeData}>
            {t("generateFakeData") || "Generate Fake Data"}
          </Button>
        </div>
        <TabsContent value="profile">
          <form className="space-y-4 mt-4" onSubmit={handleProfileSave}>
            <div>
              <label className="block text-sm font-medium mb-1">{t("adminName")}</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("password")}</label>
              <div className="relative flex items-center max-w-xs">
                <Input
                  type={pwVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  onClick={() => setPwVisible((v) => !v)}
                  title={pwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                  aria-label={pwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                  style={{ background: "none", border: "none" }}
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("confirmPassword") || "Confirm Password"}</label>
              <div className="relative flex items-center max-w-xs">
                <Input
                  type={cpwVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  onClick={() => setCpwVisible((v) => !v)}
                  title={cpwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                  aria-label={cpwVisible ? t("hide") || "Hide" : t("show") || "Show"}
                  style={{ background: "none", border: "none" }}
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="exchangeRate">{t("exchangeRate") || "Exchange Rate (USD to KHR)"}</Label>
              <Input
                id="exchangeRate"
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="4000"
              />
              <p className="text-xs text-gray-500 mt-1">1 USD = {exchangeRate || 4000} KHR</p>
            </div>
            <Button type="submit" className="mt-2">
              {t("save")}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="token">
          <div className="mt-4">
            <h2 className="text-base font-medium mb-2">{t("authToken")}</h2>
            <div className="flex items-center gap-3">
              <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">{t("expiresIn")}:</span>
              <span className="font-mono text-base">{expiry}</span>
            </div>
            <p className="mt-2 text-muted-foreground text-sm">{t("reloginToReset")}</p>
          </div>
        </TabsContent>
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
  )
}

export default Settings
