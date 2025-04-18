import type {Staff} from "@/interface/UserInterface.ts";

export interface StaffPagination {
    count: number;
    next: string | null;
    previous: string | null;
    results: Staff[];
    summary: {
        total_users: number;
        inactive_users: number;
        active_users: number;
    };
}