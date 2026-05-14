export declare class UploadController {
    uploadFile(file: Express.Multer.File): {
        url: string;
        filename: string;
    };
    serveFile(filename: string, res: any): any;
}
