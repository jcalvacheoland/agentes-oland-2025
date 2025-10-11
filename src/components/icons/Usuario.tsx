import type { iIconProps } from "@/interfaces/icons.type";
export const UsuarioIcon = ({ width = 24, height = 24, styles = '' }: iIconProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" 
        width={width} 
        height={height} 
        viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx={12} cy={6} r={4}></circle><path strokeLinecap="round" d="M15 20.615c-.91.247-1.926.385-3 .385c-3.866 0-7-1.79-7-4s3.134-4 7-4s7 1.79 7 4c0 .345-.077.68-.22 1"></path></g></svg>
    );
};
