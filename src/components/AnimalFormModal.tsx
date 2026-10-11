import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { Especie, Sexo } from "@/types";
import { getSpeciesLabel, getSexLabel, PLACEHOLDER_PET_IMAGE } from "@/lib/utils";

const ESPECIES: Especie[] = ["Cachorro", "Gato", "Passaro", "Outro"];
const SEXOS: Sexo[] = ["Macho", "Femea"];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export interface AnimalFormData {
  nome: string;
  idade: string;
  sexo: Sexo | "";
  especie: Especie | "";
  raca: string;
  cor: string;
  descricao: string;
  localizacao: string;
  foto: File | null;
}

interface AnimalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnimalFormData) => void;
  isSubmitting?: boolean;
}

export function AnimalFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AnimalFormModalProps) {
  const [formData, setFormData] = useState<AnimalFormData>({
    nome: "",
    idade: "",
    sexo: "",
    especie: "",
    raca: "",
    cor: "",
    descricao: "",
    localizacao: "",
    foto: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpa o formulário quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: "",
        idade: "",
        sexo: "",
        especie: "",
        raca: "",
        cor: "",
        descricao: "",
        localizacao: "",
        foto: null,
      });
      setImagePreview(null);
      setPhotoError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen]);

  // Libera o object URL anterior
  useEffect(() => {
    if (!formData.foto) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(formData.foto);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formData.foto]);

  const clearPhoto = () => {
    setFormData({ ...formData, foto: null });
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError(null);

    if (!file) {
      setFormData({ ...formData, foto: null });
      return;
    }

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setFormData({ ...formData, foto: null });
      setPhotoError("Formato não suportado. Envie JPEG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFormData({ ...formData, foto: null });
      setPhotoError("A foto deve ter no máximo 5 MB.");
      return;
    }

    setFormData({ ...formData, foto: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid =
    formData.nome.trim() !== "" &&
    formData.idade !== "" &&
    Number(formData.idade) >= 0 &&
    formData.sexo !== "" &&
    formData.especie !== "" &&
    !isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "overflow-hidden",
        body: "min-h-0 overflow-y-auto",
        footer: "shrink-0 border-t border-gray-200 bg-white",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Cadastrar Animal</h2>
              <p className="text-sm text-gray-600 font-normal">
                Preencha os dados do animal para disponibilizá-lo para adoção
              </p>
            </ModalHeader>
            <ModalBody>
              <form id="animal-form" onSubmit={handleSubmit}>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Coluna esquerda - preview da foto */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Foto do Animal
                  </h3>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                    <img
                      src={imagePreview || PLACEHOLDER_PET_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setFormData({ ...formData, foto: null });
                      }}
                    />
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_PHOTO_TYPES.join(",")}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="flat"
                      size="sm"
                      onPress={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      {formData.foto ? "Trocar foto" : "Escolher foto"}
                    </Button>
                    {formData.foto && (
                      <Button
                        variant="light"
                        color="danger"
                        size="sm"
                        onPress={clearPhoto}
                        type="button"
                      >
                        Remover foto
                      </Button>
                    )}
                  </div>

                  {formData.foto && (
                    <p className="mt-2 text-xs text-gray-500 truncate">
                      {formData.foto.name} ({(formData.foto.size / 1024).toFixed(0)} KB)
                    </p>
                  )}

                  {photoError && (
                    <p className="mt-2 text-sm text-danger">{photoError}</p>
                  )}
                </div>

                {/* Coluna direita - campos */}
                <div className="space-y-4">
                  <Input
                    label="Nome do Animal"
                    placeholder="Ex: Thor, Luna, Max..."
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    isRequired
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Idade (anos)"
                      placeholder="Ex: 3"
                      value={formData.idade}
                      onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                      min="0"
                      max="30"
                      isRequired
                    />

                    <Select
                      label="Sexo"
                      placeholder="Selecione"
                      selectedKeys={formData.sexo ? [formData.sexo] : []}
                      onChange={(e) =>
                        setFormData({ ...formData, sexo: e.target.value as Sexo })
                      }
                      isRequired
                    >
                      {SEXOS.map((sexo) => (
                        <SelectItem key={sexo}>{getSexLabel(sexo)}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Espécie"
                      placeholder="Selecione"
                      selectedKeys={formData.especie ? [formData.especie] : []}
                      onChange={(e) =>
                        setFormData({ ...formData, especie: e.target.value as Especie })
                      }
                      isRequired
                    >
                      {ESPECIES.map((especie) => (
                        <SelectItem key={especie}>{getSpeciesLabel(especie)}</SelectItem>
                      ))}
                    </Select>

                    <Input
                      label="Raça"
                      placeholder="Ex: Vira-lata, Labrador..."
                      value={formData.raca}
                      onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                      description="Opcional"
                    />
                  </div>

                  <Input
                    label="Cor"
                    placeholder="Ex: Preto, Branco, Marrom..."
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    description="Opcional"
                  />

                  <Input
                    label="Localização"
                    placeholder="Ex: São Paulo, SP"
                    value={formData.localizacao}
                    onChange={(e) =>
                      setFormData({ ...formData, localizacao: e.target.value })
                    }
                    description="Opcional. Onde o pet está agora."
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    }
                  />

                  <Textarea
                    label="Descrição"
                    placeholder="Personalidade, história, cuidados especiais, vacinas..."
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    description="Opcional"
                    minRows={4}
                  />
                </div>
              </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} type="button">
                Cancelar
              </Button>
              <Button
                color="primary"
                type="submit"
                form="animal-form"
                isDisabled={!isFormValid}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar Animal"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
