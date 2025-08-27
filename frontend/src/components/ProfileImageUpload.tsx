import React, { useState, useRef, useCallback } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Camera, Upload, X, RotateCcw, Check } from "lucide-react";
import ReactCrop, { 
  Crop, 
  PixelCrop, 
  centerCrop, 
  makeAspectCrop
} from 'react-image-crop';
import imageCompression from 'browser-image-compression';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/auth';
import { toast } from "sonner";
import 'react-image-crop/dist/ReactCrop.css';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUpdate: (url: string) => void;
}

// Configurações padrão para imagens de perfil
const PROFILE_IMAGE_CONFIG = {
  width: 200,
  height: 200,
  quality: 0.8,
  maxSizeMB: 0.1, // 100KB máximo
  format: 'webp' as const
};

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate
}) => {
  const { profile: user, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Função para inicializar o crop centralizado
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // aspect ratio 1:1 (quadrado)
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(crop);
  }, []);

  // Função para processar arquivo selecionado
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho do arquivo (máximo 10MB antes da compressão)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setPreviewUrl('');
      });
      reader.readAsDataURL(file);
    }
  };

  // Função para gerar preview do crop
  const generatePreview = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const image = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas com tamanho final
    canvas.width = PROFILE_IMAGE_CONFIG.width;
    canvas.height = PROFILE_IMAGE_CONFIG.height;

    // Calcular escala
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Desenhar imagem cropada no canvas
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      PROFILE_IMAGE_CONFIG.width,
      PROFILE_IMAGE_CONFIG.height
    );

    // Gerar preview URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    }, 'image/webp', PROFILE_IMAGE_CONFIG.quality);
  }, [completedCrop]);

  // Gerar preview quando crop for alterado
  React.useEffect(() => {
    if (completedCrop) {
      generatePreview();
    }
  }, [completedCrop, generatePreview]);

  // Função para fazer upload da imagem
  const uploadImage = async () => {
    if (!imgRef.current || !completedCrop || !user) {
      console.error('❌ Pré-requisitos não atendidos:', {
        imgRef: !!imgRef.current,
        completedCrop: !!completedCrop,
        user: !!user,
        userId: user?.id
      });
      toast.error('Erro: dados necessários para upload não estão disponíveis');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('🚀 Iniciando upload de imagem...');
      console.log('👤 Usuário:', { id: user.id, email: user.email });
      console.log('📁 Configuração:', PROFILE_IMAGE_CONFIG);
      const canvas = previewCanvasRef.current;
      if (!canvas) throw new Error('Canvas não encontrado');

      // Converter canvas para blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/webp', PROFILE_IMAGE_CONFIG.quality);
      });

      // Comprimir imagem
      const compressedFile = await imageCompression(blob as File, {
        maxSizeMB: PROFILE_IMAGE_CONFIG.maxSizeMB,
        maxWidthOrHeight: PROFILE_IMAGE_CONFIG.width,
        useWebWorker: true,
        fileType: 'image/webp'
      });

      console.log(`📸 Imagem comprimida: ${(compressedFile.size / 1024).toFixed(1)}KB`);

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `profile-${user.id}-${timestamp}.webp`;
      const filePath = `profiles/${fileName}`;

      console.log('📂 Arquivo:', { fileName, filePath, size: compressedFile.size });

      // Fazer upload para Supabase Storage
      console.log('⬆️ Fazendo upload para Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      console.log('📦 Resultado do upload:', { data, error });

      if (error) {
        console.error('❌ Erro no upload:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Mostrar erro específico para o usuário
        if (error.message.includes('Bucket not found')) {
          toast.error('Bucket de storage não encontrado. Verifique a configuração.');
        } else if (error.message.includes('policy')) {
          toast.error('Erro de permissão. Verifique as políticas RLS do storage.');
        } else if (error.message.includes('size')) {
          toast.error('Arquivo muito grande. Máximo permitido: 1MB');
        } else {
          toast.error(`Erro no upload: ${error.message}`);
        }
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Atualizar perfil no banco de dados
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          foto_perfil: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar perfil:', updateError);
        console.error('❌ Detalhes do erro do banco:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        
        // Mostrar erro específico para o usuário
        if (updateError.message.includes('column') && updateError.message.includes('foto_perfil')) {
          toast.error('Coluna foto_perfil não existe. Execute o script de migração do banco.');
        } else if (updateError.message.includes('permission')) {
          toast.error('Erro de permissão no banco de dados.');
        } else {
          toast.error(`Erro ao salvar no banco: ${updateError.message}`);
        }
        throw updateError;
      }

      console.log('✅ Foto de perfil atualizada com sucesso');
      toast.success('Foto de perfil atualizada com sucesso!');
      
      // Chamar callback para atualizar UI
      onImageUpdate(publicUrl);
      
      // Recarregar perfil no contexto para atualizar sidebar (não bloquear se der erro)
      try {
        await refreshProfile();
      } catch (refreshError) {
        console.warn('⚠️ Erro ao recarregar perfil (não crítico):', refreshError);
      }
      
      // Fechar modal
      handleClose();

    } catch (error) {
      console.error('❌ Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  };

  // Função para remover foto de perfil
  const removeImage = async () => {
    if (!user) return;

    setIsUploading(true);
    
    try {
      // Atualizar perfil removendo foto
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          foto_perfil: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      console.log('✅ Foto de perfil removida com sucesso');
      toast.success('Foto de perfil removida com sucesso!');
      
      // Chamar callback para atualizar UI
      onImageUpdate('');
      
      // Recarregar perfil no contexto para atualizar sidebar (não bloquear se der erro)
      try {
        await refreshProfile();
      } catch (refreshError) {
        console.warn('⚠️ Erro ao recarregar perfil (não crítico):', refreshError);
      }
      
      // Fechar modal
      handleClose();

    } catch (error) {
      console.error('❌ Erro ao remover foto:', error);
      toast.error('Erro ao remover foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  // Função para fechar modal e limpar estado
  const handleClose = () => {
    setIsOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreviewUrl('');
    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = '';
    }
  };

  // Função para abrir seletor de arquivo
  const handleSelectClick = () => {
    hiddenFileInput.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24">
        {currentImageUrl ? (
          <AvatarImage src={currentImageUrl} alt="Foto de perfil" />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex flex-col gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Alterar foto
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Alterar Foto de Perfil</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {!imgSrc ? (
                <div className="text-center py-8">
                  <Input
                    ref={hiddenFileInput}
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="hidden"
                  />
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <Label className="text-lg font-medium">Selecione uma imagem</Label>
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos aceitos: JPG, PNG, WEBP (máximo 10MB)
                    </p>
                    <Button 
                      onClick={handleSelectClick}
                      className="mt-4"
                      variant="outline"
                    >
                      Escolher arquivo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {/* Área de crop */}
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-2 block">
                        Ajustar área da foto
                      </Label>
                      <div className="border rounded-lg overflow-hidden">
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={1}
                          minWidth={50}
                          minHeight={50}
                        >
                          <img
                            ref={imgRef}
                            alt="Crop"
                            src={imgSrc}
                            onLoad={onImageLoad}
                            style={{ maxHeight: '400px', width: 'auto' }}
                          />
                        </ReactCrop>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="w-48">
                      <Label className="text-sm font-medium mb-2 block">
                        Preview (200x200px)
                      </Label>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs text-gray-500 text-center mt-2">
                          ~{PROFILE_IMAGE_CONFIG.maxSizeMB * 1000}KB máx
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Canvas oculto para processamento */}
                  <canvas
                    ref={previewCanvasRef}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Botões de ação */}
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSelectClick}
                        disabled={isUploading}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Escolher outra
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isUploading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={uploadImage}
                        disabled={!completedCrop || isUploading}
                      >
                        {isUploading ? (
                          <>Salvando...</>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Salvar foto
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {currentImageUrl && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-destructive flex items-center gap-2"
            onClick={removeImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;