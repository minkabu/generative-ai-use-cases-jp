import React, { useCallback, useMemo } from 'react';
import ButtonSend from './ButtonSend';
import Textarea from './Textarea';
import ZoomUpImage from './ZoomUpImage';
import usePdfChat from '../hooks/usePdfChat';
import { useLocation } from 'react-router-dom';
import Button from './Button';
import Markdown from '../components/Markdown';
import {
  PiArrowsCounterClockwise,
  PiPaperclip,
  PiSpinnerGap,
} from 'react-icons/pi';

import useFile from '../hooks/useFile';

type Props = {
  content: string;
  disabled?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  resetDisabled?: boolean;
  loadingNow?: boolean;
  onChangeContent: (content: string) => void;
  onSend: () => void;
  sendIcon?: React.ReactNode;
  // ページ下部以外で使う時に margin bottom を無効化するためのオプション
  disableMarginBottom?: boolean;
  fileUpload?: boolean;
  pdfUpload?: boolean;
} & (
  | {
      hideReset?: false;
      onReset: () => void;
    }
  | {
      hideReset: true;
    }
);

const InputPdfChatContent: React.FC<Props> = (props) => {
  const { pathname } = useLocation();
  const { loading: chatLoading, isEmpty } = usePdfChat(pathname);
  const { file, loading, setFile, recognizedText, recognizePdf } = useFile();

  const onChangeFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // ファイルを反映しアップロード
      setFile(files[0])
      recognizePdf();
    }
  };

  const handlePaste = async (pasteEvent: React.ClipboardEvent) => {
    const fileList = pasteEvent.clipboardData.items || [];
    const files = Array.from(fileList)
      .filter((file) => file.kind === 'file')
      .map((file) => file.getAsFile() as File);
    if (files.length > 0) {
      // ファイルをアップロード
      setFile(files[0])
      recognizePdf();
      // ファイルの場合ファイル名もペーストされるためデフォルトの挙動を止める
      pasteEvent.preventDefault();
    }
    // ファイルがない場合はデフォルトの挙動（テキストのペースト）
  };

  const loadingNow = useMemo(() => {
    return props.loadingNow === undefined ? chatLoading : props.loadingNow;
  }, [chatLoading, props.loadingNow]);

  const disabledSend = useMemo(() => {
    return props.content === '' || props.disabled || loadingNow;
  }, [props.content, props.disabled, loadingNow]);

  const pdfContentStyle = {
    height: '10em',
    overflow: 'auto',
  };

  return (
    <div
      className={`${
        props.fullWidth ? 'w-full' : 'w-11/12 md:w-10/12 lg:w-4/6 xl:w-3/6'
      }`}>
      <div
        className={`relative flex items-end rounded-xl border border-black/10 bg-gray-100 shadow-[0_0_30px_1px] shadow-gray-400/40 ${
          props.disableMarginBottom ? '' : 'mb-7'
        }`}>
        <div className="flex w-full flex-col">
          <Textarea
            className="scrollbar-thumb-gray-200 scrollbar-thin m-2 -mr-14 bg-transparent pr-14 "
            placeholder={props.placeholder ?? '入力してください'}
            noBorder
            notItem
            value={props.content}
            onChange={props.onChangeContent}
            onPaste={props.fileUpload ? handlePaste : undefined}
            onEnter={disabledSend ? undefined : props.onSend}
          />
        </div>
        {props.fileUpload && (
          <label>
            <input
              hidden
              onChange={onChangeFiles}
              type="file"
              accept='.pdf'
              multiple
              value={[]}
            />
            <div
              className={`${loadingNow ? 'bg-gray-300' : 'bg-aws-smile cursor-pointer '} my-2 flex items-center justify-center rounded-xl p-2 align-bottom text-xl text-white`}>
              {loadingNow ? (
                <PiSpinnerGap className="animate-spin" />
              ) : (
                <PiPaperclip />
              )}
            </div>
          </label>
        )}
        <ButtonSend
          className="m-2 align-bottom"
          disabled={disabledSend}
          loading={loadingNow || loading}
          onClick={props.onSend}
          icon={props.sendIcon}
        />

        {!isEmpty && !props.resetDisabled && !props.hideReset && (
          <Button
            className="absolute -top-14 right-0 p-2 text-sm"
            outlined
            disabled={loading}
            onClick={props.onReset}>
            <PiArrowsCounterClockwise className="mr-2" />
            最初からやり直す
          </Button>
        )}
      </div>
      {props.pdfUpload && (
          <div className="mt-5 rounded border border-black/30 p-1.5">
            {!loading && recognizedText == '' && (
              <div className="text-gray-500">
                ファイル認識結果がここに表示されます
              </div>
            )}
            {loading && (
              <div className="border-aws-sky size-5 animate-spin rounded-full border-4 border-t-transparent"></div>
            )}
            {!loading && recognizedText != '' && (
            <div className="flex w-full justify-end" style={pdfContentStyle}>
              {recognizedText}
            </div>
            )}
          </div>
       )}
    </div>
  );
};

export default InputPdfChatContent;
