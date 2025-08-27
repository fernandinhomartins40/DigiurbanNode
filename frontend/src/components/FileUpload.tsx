import React, { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { validationUtils } from "@/lib/validation";
import { protocolosService } from "@/lib/protocolos";
import { toast } from 'sonner';

interface FileUploadProps {
  protocoloId: string;
  tipoAnexo?: 'documento' | 'comprovante' | 'foto' | 'outro';
  obrigatorio?: boolean;
  maxSize?: number; // em bytes
  allowedTypes?: string[];
  multiple?: boolean;
  onUploadComplete?: (anexos: unknown[]) => void;
  onError?: (error: string) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  protocoloId,
  tipoAnexo = 'documento',
  obrigatorio = false,
  maxSize = 10 * 1024 * 1024, // 10MB padrão
  allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  multiple = false,
  onUploadComplete,
  onError
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Validar arquivo individual
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Verificar tamanho
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Verificar tipo
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes.map(type => {
        switch (type) {
          case 'application/pdf': return '.pdf';
          case 'image/jpeg': return '.jpg/.jpeg';
          case 'image/png': return '.png';
          case 'image/gif': return '.gif';
          case 'application/msword': return '.doc';
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '.docx';
          case 'application/vnd.ms-excel': return '.xls';
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': return '.xlsx';
          default: return type;
        }
      });
      
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedExtensions.join(', ')}`
      };
    }

    // Verificar nome do arquivo
    if (file.name.length > 255) {
      return {
        valid: false,
        error: 'Nome do arquivo muito longo (máximo 255 caracteres)'
      };
    }

    return { valid: true };
  }, [maxSize, allowedTypes]);

  // Processar arquivos selecionados
  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithProgress[] = [];
    let hasErrors = false;

    // Verificar se não excede o limite (se não é múltiplo)
    if (!multiple && files.length > 0) {
      toast.error('Apenas um arquivo é permitido');
      return;
    }

    Array.from(fileList).forEach((file, index) => {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        hasErrors = true;
        return;
      }

      newFiles.push({
        file,
        progress: 0,
        status: 'pending',
        id: `${Date.now()}-${index}`
      });
    });

    if (!hasErrors && newFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles(newFiles);
      }
      setGlobalError(null);
    }
  }, [files.length, multiple, validateFile]);

  // Upload de um arquivo
  const uploadFile = useCallback(async (fileWithProgress: FileWithProgress) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileWithProgress.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ));

      // Simular progresso (o Supabase não fornece progresso real de upload)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === fileWithProgress.id && f.status === 'uploading'
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 200);

      // Upload real
      const anexo = await protocolosService.adicionarAnexo(
        protocoloId,
        fileWithProgress.file,
        tipoAnexo,
        obrigatorio
      );

      clearInterval(progressInterval);

      setFiles(prev => prev.map(f => 
        f.id === fileWithProgress.id 
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ));

      toast.success(`${fileWithProgress.file.name} enviado com sucesso!`);
      
      if (onUploadComplete) {
        onUploadComplete([anexo]);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      
      setFiles(prev => prev.map(f => 
        f.id === fileWithProgress.id 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));

      toast.error(`Erro ao enviar ${fileWithProgress.file.name}: ${errorMessage}`);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [protocoloId, tipoAnexo, obrigatorio, onUploadComplete, onError]);

  // Upload de todos os arquivos pendentes
  const uploadAllFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  }, [files, uploadFile]);

  // Remover arquivo
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Handlers de drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Handler de input de arquivo
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // Obter ícone do status
  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasPendingFiles = files.some(f => f.status === 'pending');
  const hasUploadingFiles = files.some(f => f.status === 'uploading');

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <CardContent 
          className="p-6 text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Clique para selecionar ou arraste arquivos aqui
          </p>
          <p className="text-xs text-gray-500">
            Tamanho máximo: {Math.round(maxSize / 1024 / 1024)}MB
            {multiple ? ' (múltiplos arquivos)' : ' (um arquivo)'}
          </p>
          
          <input
            id="file-input"
            type="file"
            multiple={multiple}
            accept={allowedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Arquivos selecionados</h4>
            {hasPendingFiles && (
              <Button 
                size="sm" 
                onClick={uploadAllFiles}
                disabled={hasUploadingFiles}
              >
                Enviar Todos
              </Button>
            )}
          </div>

          {files.map((fileWithProgress) => (
            <Card key={fileWithProgress.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getStatusIcon(fileWithProgress.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithProgress.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileWithProgress.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {fileWithProgress.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => uploadFile(fileWithProgress)}
                    >
                      Enviar
                    </Button>
                  )}
                  
                  {fileWithProgress.status !== 'uploading' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeFile(fileWithProgress.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Barra de progresso */}
              {fileWithProgress.status === 'uploading' && (
                <div className="mt-2">
                  <Progress value={fileWithProgress.progress} className="h-1" />
                </div>
              )}

              {/* Erro */}
              {fileWithProgress.status === 'error' && fileWithProgress.error && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {fileWithProgress.error}
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Erro global */}
      {globalError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;