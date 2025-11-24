import { TOKEN_KEY } from "../util/system";

export function save(token:string){
    return localStorage.setItem(TOKEN_KEY,token);
}