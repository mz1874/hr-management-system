export interface PersonalKPIInterface{
    id : number;
    kpi_title : string;
    target_unit : number;
    completed_unit: number;
    task_start_date: string;
    task_completion_date: string;
    individual_unit: string;
    current_status : string;
    kpi:{
        task_description:string
        seventy_percent:number,
        ninety_percent:number,
        hundred_percent:number,
        hundred_twenty_percent:number
    }
}