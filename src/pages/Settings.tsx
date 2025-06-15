
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
  // Token State
  const [expiry, setExpiry] = useState(getTokenExpiry());
  // Backup State
  const [backupText, setBackupText] = useState("");

  useEffect(() => {
    const { name, password } = getAdminProfile();
    setName(name);
    setPassword(password);
    const interval = setInterval(() => setExpiry(getTokenExpiry()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Profile Save
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdminProfile(name, password);
    toast({ title: "Profile updated", description: "Admin information saved." });
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
    toast({ title: "Backup ready", description: "Data exported to the textbox below." });
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
      toast({ title: "Restore complete", description: "Backup restored from text." });
    } catch (e) {
      toast({ title: "Restore failed", description: "Invalid backup format.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="token">Token</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        {/* Profile Tab */}
        <TabsContent value="profile">
          <form className="space-y-4 mt-4" onSubmit={handleProfileSave}>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="max-w-xs"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="mt-2">Save</Button>
          </form>
        </TabsContent>
        {/* Token Tab */}
        <TabsContent value="token">
          <div className="mt-4">
            <h2 className="text-base font-medium mb-2">Auth Token</h2>
            <div className="flex items-center gap-3">
              <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Expires In:
              </span>
              <span className="font-mono text-base">{expiry}</span>
            </div>
            <p className="mt-2 text-muted-foreground text-sm">Relogin to reset expiry to 24h.</p>
          </div>
        </TabsContent>
        {/* Backup Tab */}
        <TabsContent value="backup">
          <div className="mt-4 flex flex-col gap-2">
            <Button type="button" onClick={handleBackup} size="sm">
              Export Data (Backup)
            </Button>
            <textarea
              className="w-full h-36 border rounded p-2 text-xs font-mono bg-gray-50"
              value={backupText}
              onChange={(e) => setBackupText(e.target.value)}
              placeholder="Backup JSON will appear here"
            />
            <Button type="button" onClick={handleRestore} size="sm" variant="outline">
              Restore Data (Paste backup here)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
