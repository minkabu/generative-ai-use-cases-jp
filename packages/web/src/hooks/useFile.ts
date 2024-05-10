import { create } from 'zustand';
import useFileApi from './useFileApi';

const useFileState = create<{
  loading: boolean;
  file: File | null;
  setFile: (file: File) => void;
  recognizeFile: () => Promise<void>;
  recognizePdf: () => Promise<void>;
  recognizedText: string;
  clear: () => void;
}>((set, get) => {
  const api = useFileApi();

  const setFile = (file: File) => {
    set(() => ({
      file: file,
    }));
  };

  const clear = () => {
    set(() => ({
      file: null,
      recognizedText: '',
    }));
  };

  const recognizeFile = async () => {
    set(() => ({
      loading: true,
      recognizedText: '',
    }));

    const mediaFormat = get().file?.name.split('.').pop() as string;
    console.log('media:' + mediaFormat);
    // 署名付き URL の取得
    const signedUrlRes = await api.getSignedUrl({
      mediaFormat: mediaFormat,
    });
    const signedUrl = signedUrlRes.data;
    const fileUrl = signedUrl.split(/[?#]/)[0]; // 署名付き url からクエリパラメータを除外
    console.log('fileUrl:' + fileUrl);
    // ファイルのアップロード
    await api.uploadFile(signedUrl, { file: get().file! });

    // ファイル認識
    const res:any = await api
      .recognizeFile({
        fileUrl: fileUrl,
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        set(() => ({
          loading: false,
        }));
      });
    set(() => ({
      recognizedText: res.data.text,
    }));
  };

  const recognizePdf = async () => {
    set(() => ({
      loading: true,
      recognizedText: '',
    }));

    const mediaFormat = get().file?.name.split('.').pop() as string;
    console.log('media:' + mediaFormat);
    // 署名付き URL の取得
    console.log('file:' + get().file);

    // ファイル認識
    const res:any = await api
      .recognizePdf({
        files: get().file!,
        strategy: 'auto'
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        set(() => ({
          loading: false,
        }));
      });
    set(() => ({
      recognizedText: res.data.map(e => e.text).join(' '),
    }));
  };

  return {
    file: null,
    loading: false,
    clear,
    setFile,
    recognizeFile,
    recognizePdf,
    recognizedText: '',
  };
});

const useFile = () => {
  const { file, loading, recognizedText, clear, setFile, recognizeFile, recognizePdf} =
    useFileState();
  return {
    file,
    loading,
    recognizedText,
    clear,
    setFile,
    recognizeFile,
    recognizePdf
  };
};
export default useFile;
