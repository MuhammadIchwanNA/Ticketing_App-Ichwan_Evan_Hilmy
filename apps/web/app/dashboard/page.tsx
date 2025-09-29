"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import OrganizerDashboard from "../../components/dashboard/OrganizerDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const user = res.data.user;

        if (user.role === "ORGANIZER") {
          setAuthorized(true);
        } else {
          router.push("/auth");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <p className="text-center p-6">Checking authorization...</p>;
  }

  if (!authorized) {
    return null; // since router.push will redirect
  }

  return <OrganizerDashboard />;
}
