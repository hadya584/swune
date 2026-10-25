"use client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

//undefined means still checking, null means logged out, otherwise the logged in user
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    //checks if someone was already logged in from before
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    //listens for log ins and log outs while the page is open
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    //stops listening when the page closes
    return () => data.subscription.unsubscribe();
  }, []);
  return user;
}