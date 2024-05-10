import {
  GetFileUploadSignedUrlRequest,
  GetFileUploadSignedUrlResponse,
  RecognizeFileRequest,
  RecognizePdfRequest,
  RecognizeFileResponse,
  UploadFileRequest,
  GetDocDownloadSignedUrlRequest,
  GetDocDownloadSignedUrlResponse,
  DeleteFileResponse,
} from 'generative-ai-use-cases-jp';
import useHttp from './useHttp';
import axios from 'axios';

const useFileApi = () => {
  const http = useHttp();
  return {
    getSignedUrl: (req: GetFileUploadSignedUrlRequest) => {
      return http.post<GetFileUploadSignedUrlResponse>('file/url', req);
    },
    recognizeFile: (req: RecognizeFileRequest) => {
      return http.post<RecognizeFileResponse>('file/recognize', req);
    },
    recognizePdf: (req: RecognizePdfRequest) => {
      const form = new FormData();
      form.append('files', req.files);
      form.append('strategy', req.strategy);
      return axios({
        method: 'POST',
        url: 'http://ec2-54-64-175-245.ap-northeast-1.compute.amazonaws.com:8000/general/v0/general',
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
        data: form,
      });
    },
    uploadFile: (url: string, req: UploadFileRequest) => {
      return axios({
        method: 'PUT',
        url: url,
        headers: { 'Content-Type': 'file/*' },
        data: req.file,
      });
    },
    getDocDownloadSignedUrl: async (s3Url: string) => {
      // Signed URL を取得
      const bucketName = s3Url.split('/')[2].split('.')[0];
      const filePrefix = s3Url.split('/').slice(3).join('/');
      const params: GetDocDownloadSignedUrlRequest = {
        bucketName,
        filePrefix,
      };
      const { data: url } = await http.api.get<GetDocDownloadSignedUrlResponse>(
        '/file/url',
        {
          params,
        }
      );
      return url;
    },
    deleteUploadedFile: async (fileName: string) => {
      return http.delete<DeleteFileResponse>(`file/${fileName}`);
    },
  };
};

export default useFileApi;
