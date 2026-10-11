/** Documentation types. Runtime geometry is authored in spec.mjs and measured in inches. */
export interface Panel {id:'A'|'B';qty:number;width:number;centres:number[]}
export interface Material {id:string;name:string;qty:number;size:string;stock:string;note:string}
export interface Product {id:string;revision:string;units:'in';status:'PRELIMINARY';clear:number;height:number;ply:number;panels:Panel[];collarDatums:number[];nailPositions:number[]}
