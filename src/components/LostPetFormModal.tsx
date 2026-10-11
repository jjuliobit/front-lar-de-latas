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
import { Especie, SexoPetPerdido } from "@/types";
import { getSpeciesLabel, getSexLabel, PLACEHOLDER_PET_IMAGE } from "@/lib/utils";

const ESPECIES: Especie[] = ["Cachorro", "Gato", "Passaro", "Outro"];
const SEXOS: SexoPetPerdido[] = ["Macho", "Femea"];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export interface LostPetFormData {
  nome: string;
  especie: Especie | "";
  sexo: SexoPetPerdido | "";
  raca: string;
  cor: string;
  localizacao: string;
  dataUltimaVez: string;
  descricao: string;
  nomeContato: string;
  telefoneContato: string;
  emailContato: string;
  foto: File | null;
}

interface LostPetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LostPetFormData) => void;
  isSubmitting?: boolean;
}

export function LostPetFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: LostPetFormModalProps) {
  const [formData, setFormData] = useState<LostPetFormData>({
    nome: "",
    especie: "",
    sexo: "",
    raca: "",
    cor: "",
    localizacao: "",
    dataUltimaVez: "",
    descricao: "",
    nomeContato: "",
    telefoneContato: "",
    emailContato: "",
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
        especie: "",
        sexo: "",
        raca: "",
        cor: "",
        localizacao: "",
        dataUltimaVez: "",
        descricao: "",
        nomeContato: "",
        telefoneContato: "",
        emailContato: "",
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
    formData.especie !== "" &&
    formData.localizacao.trim() !== "" &&
    formData.dataUltimaVez !== "" &&
    formData.nomeContato.trim() !== "" &&
    formData.telefoneContato.trim() !== "" &&
    formData.emailContato.trim() !== "" &&
    !isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
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
              <h2 className="text-2xl font-bold">Cadastrar Animal Perdido</h2>
              <p className="text-sm text-gray-600 font-normal">
                Preencha os dados para ajudar a encontrar o animal
              </p>
            </ModalHeader>
            <ModalBody>
              <form id="lost-pet-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Foto do Animal
                    </h3>
                    <div className="w-full aspect-square max-w-[180px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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

                    <div className="mt-3 flex flex-wrap gap-2">
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
                          Remover
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

                    <p className="mt-2 text-xs text-gray-500">
                      JPEG, PNG, WebP ou GIF. Máximo de 5 MB.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Informações do Animal
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Nome do Animal"
                        placeholder="Ex: Thor, Luna, Max..."
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        isRequired
                      />

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
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Select
                        label="Sexo (opcional)"
                        placeholder="Selecione"
                        selectedKeys={formData.sexo ? [formData.sexo] : []}
                        onChange={(e) =>
                          setFormData({ ...formData, sexo: e.target.value as SexoPetPerdido })
                        }
                      >
                        {SEXOS.map((sexo) => (
                          <SelectItem key={sexo}>{getSexLabel(sexo)}</SelectItem>
                        ))}
                      </Select>

                      <Input
                        label="Raça (opcional)"
                        placeholder="Ex: Vira-lata, Labrador..."
                        value={formData.raca}
                        onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
                      />
                    </div>

                    <Input
                      label="Cor (opcional)"
                      placeholder="Ex: Preto, Branco, Marrom..."
                      value={formData.cor}
                      onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    />

                    <Textarea
                      label="Descrição (opcional)"
                      placeholder="Características, comportamento ou algo que ajude a reconhecer o animal"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      minRows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    Local e Data
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Visto pela última vez em"
                      placeholder="Ex: Praça da Vila Mariana, São Paulo - SP"
                      value={formData.localizacao}
                      onChange={(e) =>
                        setFormData({ ...formData, localizacao: e.target.value })
                      }
                      isRequired
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

                    <Input
                      type="date"
                      label="Data em que foi visto"
                      value={formData.dataUltimaVez}
                      onChange={(e) =>
                        setFormData({ ...formData, dataUltimaVez: e.target.value })
                      }
                      isRequired
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    Informações de Contato
                  </h3>

                  <Input
                    label="Nome do responsável"
                    placeholder="Seu nome completo"
                    value={formData.nomeContato}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeContato: e.target.value })
                    }
                    isRequired
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      type="tel"
                      label="Telefone"
                      placeholder="(11) 99999-9999"
                      value={formData.telefoneContato}
                      onChange={(e) =>
                        setFormData({ ...formData, telefoneContato: e.target.value })
                      }
                      isRequired
                    />

                    <Input
                      type="email"
                      label="E-mail"
                      placeholder="seu@email.com"
                      value={formData.emailContato}
                      onChange={(e) =>
                        setFormData({ ...formData, emailContato: e.target.value })
                      }
                      isRequired
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
                form="lost-pet-form"
                isDisabled={!isFormValid}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar Animal Perdido"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
