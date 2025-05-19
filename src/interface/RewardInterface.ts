import type {Staff} from "@/interface/UserInterface"
import type { FileUpload } from "@/interface/FileUpload"
import type {Task} from  "@/interface/KpiInterface.ts";

export interface RewardItem {
    id: number
    rewardName: string
    rewardPoints: number
    createdOn: string
    quantity: number
    endDateTime: string
    description: string
    terms: string
    status: string   
    fileId: number             
    fileDetails: FileUpload
}

export interface RewardRedemptionItem {
    id: number
    redeemedOn: string
    rewardId: number
    rewardTitle: string
    rewardDescription: string
    rewardTerms: string
    rewardEndDateTime: string
    rewardImageId: number
    rewardImageUrl: string
    pointsDeducted: number
    status: string
    user: Staff
}

export interface PointHistoryItem {
    id: number
    user: Staff
    pointType: string
    pointsReceivedOn: string
    pointsValues: number
    pointsDeduction?: {
        id: number
        deductionTypes: string
        pointsDeducted: number
    }[],
    pointsAddition?: {
        id: number
        additionTypes: string
        pointsAddition: number
    },
    kpiCompleted?: {
        id: number
        kpiCompletedTypes: string
        taskTitleStored: string
        taskDescriptionStored: string
        taskStartDateStored: string
        taskCompletionDateStored: string
        pointsEarnedStored: number
        targetUnitStored: number
        individualUnitStored: string
    }
}

export interface PointItem {
    date: string | number | Date;
    id: number
    user: Staff
    details: {
        title: string,
        type: string,
        points: number,
        date: string
    }[]
}