import { ref } from 'vue'
import type {Department} from "@/interface/DepartmentInterface.ts";

export default function () {
    const departments = ref<Department[]>([])

    return { departments }
}
