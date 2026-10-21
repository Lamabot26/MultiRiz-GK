"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/app";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus, Info } from "lucide-react";

export function AuthDialog() {
  const { authOpen, authMode, setAuthOpen, setUser, investIntent, clearInvestIntent } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    utilityName: "",
    consumerNumber: "",
  });

  useEffect(() => {
    if (!authOpen) setForm({ name: "", email: "", phone: "", password: "", utilityName: "", consumerNumber: "" });
  }, [authOpen]);

  const isLogin = authMode === "login";
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Authentication failed", description: data.error ?? "Please try again.", variant: "destructive" });
        return;
      }
      setUser(data.user);
      setAuthOpen(false);
      toast({
        title: isLogin ? `Welcome back, ${data.user.name.split(" ")[0]}!` : "Account created successfully",
        description: isLogin ? "You are signed in." : "Your paperless investor account is ready.",
      });
      if (investIntent?.projectId) {
        const pid = investIntent.projectId;
        const amt = investIntent.amount;
        clearInvestIntent();
        setTimeout(() => useApp.getState().startInvest(pid, amt), 0);
      } else {
        useApp.getState().setView("dashboard");
      }
    } catch {
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setForm((f) => ({ ...f, email: "demo@gridkavach.com", password: "demo1234" }));
  }

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent className="sm:max-w-md kg-scroll max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isLogin ? <LogIn className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            {isLogin ? "Sign in to GridKavach" : "Create your investor account"}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Access your reservations, credits and paperless agreements."
              : "One paperless account to reserve solar capacity, track credits and adjust your electricity bill."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          {!isLogin && (
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={set("name")} placeholder="e.g. Ananya Sharma" autoComplete="name" />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
          </div>
          {!isLogin && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Mobile number</Label>
                <Input id="phone" required inputMode="numeric" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" autoComplete="tel" />
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="utility">Your DISCOM</Label>
                  <Input id="utility" value={form.utilityName} onChange={set("utilityName")} placeholder="e.g. TPCODL, MSEDCL, TNEB" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="consumer">Consumer no.</Label>
                  <Input id="consumer" value={form.consumerNumber} onChange={set("consumerNumber")} placeholder="Bill account number" />
                </div>
              </div>
            </>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={form.password} onChange={set("password")} placeholder={isLogin ? "Your password" : "Min. 8 characters"} autoComplete={isLogin ? "current-password" : "new-password"} />
          </div>

          <Button type="submit" disabled={loading} className="mt-1 h-11">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Sign in" : "Create account"}
          </Button>

          <button
            type="button"
            onClick={() => setAuthOpen(true, isLogin ? "register" : "login")}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {isLogin ? "New to GridKavach? Create an account" : "Already have an account? Sign in"}
          </button>

          {isLogin && (
            <div className="flex items-start gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 p-3 text-xs text-blue-900">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Try the live demo investor:{" "}
                <button type="button" onClick={fillDemo} className="font-semibold underline">
                  fill demo credentials
                </button>{" "}
                (demo@gridkavach.com / demo1234)
              </span>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
