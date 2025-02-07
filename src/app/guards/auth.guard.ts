import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { SupabaseService } from "../services/supabase/supabase.service";

export const authGuard: CanActivateFn = async ( next: ActivatedRouteSnapshot,  state: RouterStateSnapshot) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabaseService.supabase.auth.getSession();

  if (!session.data.session) {
    router.navigate(["/auth"]);
    return false;
  }

  return true;
};
