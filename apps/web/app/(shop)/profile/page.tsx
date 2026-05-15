"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { User } from "shared-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

const emptyAddress = {
  fullName: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  city: "",
  isDefault: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", avatar: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  useEffect(() => {
    if (tokens?.accessToken) {
      apiClient.setToken(tokens.accessToken);
    }

    const loadProfile = async () => {
      try {
        const [userResponse, addressResponse] = await Promise.all([
          apiClient.fetch<{ data: User }>("/users/me"),
          apiClient.fetch<{ data: Address[] }>("/users/me/addresses"),
        ]);

        setUser(userResponse.data);
        setProfile({
          name: userResponse.data.name || "",
          phone: userResponse.data.phone || "",
          avatar: userResponse.data.avatar || "",
        });
        setAddresses(addressResponse.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load profile");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router, setUser, tokens?.accessToken]);

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await apiClient.fetch<{ data: User }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setUser(response.data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addAddress = async () => {
    setIsSavingAddress(true);
    try {
      const response = await apiClient.fetch<{ data: Address }>("/users/me/addresses", {
        method: "POST",
        body: JSON.stringify(addressForm),
      });
      setAddresses((current) => [
        response.data,
        ...current.map((item) =>
          response.data.isDefault ? { ...item, isDefault: false } : item,
        ),
      ]);
      setAddressForm(emptyAddress);
      toast.success("Address added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await apiClient.fetch(`/users/me/addresses/${id}`, { method: "DELETE" });
      setAddresses((current) => current.filter((item) => item.id !== id));
      toast.success("Address deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete address");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={profile.avatar}
                onChange={(event) => setProfile({ ...profile, avatar: event.target.value })}
              />
            </div>
            <Button className="h-10 w-full" onClick={saveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save profile
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
            <CardDescription>Shipping addresses for checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Full name"
                value={addressForm.fullName}
                onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })}
              />
              <Input
                placeholder="Phone"
                value={addressForm.phone}
                onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })}
              />
              <Input
                className="md:col-span-2"
                placeholder="Street"
                value={addressForm.street}
                onChange={(event) => setAddressForm({ ...addressForm, street: event.target.value })}
              />
              <Input
                placeholder="Ward"
                value={addressForm.ward}
                onChange={(event) => setAddressForm({ ...addressForm, ward: event.target.value })}
              />
              <Input
                placeholder="District"
                value={addressForm.district}
                onChange={(event) => setAddressForm({ ...addressForm, district: event.target.value })}
              />
              <Input
                placeholder="City"
                value={addressForm.city}
                onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(event) =>
                    setAddressForm({ ...addressForm, isDefault: event.target.checked })
                  }
                />
                Default address
              </label>
            </div>
            <Button className="h-10" onClick={addAddress} disabled={isSavingAddress}>
              {isSavingAddress ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
              Add address
            </Button>

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No addresses yet.
                </p>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="flex items-start justify-between gap-3 rounded-lg border p-4">
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">
                        {address.fullName} {address.isDefault && <span className="text-primary">(default)</span>}
                      </div>
                      <div className="text-muted-foreground">{address.phone}</div>
                      <div>
                        {address.street}, {address.ward}, {address.district}, {address.city}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteAddress(address.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
