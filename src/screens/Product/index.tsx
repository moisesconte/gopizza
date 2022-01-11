import React, { useState, useEffect } from "react";
import { Alert, TouchableOpacity, Platform, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native'
import { ProductNavigationProps } from '@src/@types/navigation';

import { ButtonBack } from "@components/ButtonBack";
import { Photo } from "@components/Photo";
import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { InputPrice } from "@components/InputPrice";
import { ProductProps } from "@components/ProductCard";

import {
  Container,
  Header,
  Title,
  DeleteLabel,
  Upload,
  PickImageButton,
  Form,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCharacteres
} from "./styles";

type PizzaResponse = ProductProps & {
  photo_path: string;
  prices_sizes: {
    p: string;
    m: string;
    g: string;
  }
}

export function Product() {
  const [photoPath, setPhotoPath] = useState('');
  const [image, setImage] = useState("");
  const [newImage, setNewImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceSizeP, setPriceSizeP] = useState("");
  const [priceSizeM, setPriceSizeM] = useState("");
  const [priceSizeG, setPriceSizeG] = useState("");
  const [descriptionLength, setDescriptionLength] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as ProductNavigationProps;

  async function handlePickerImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4],
      });

      if (id && !result.cancelled) {
        setNewImage(result.uri);
      }

      if (!result.cancelled) {

        if (!id) {
          setImage(result.uri);
        } else {
          setNewImage(result.uri);
        }
      }
    }
  }

  async function handleAdd() {
    if (!name.trim()) {
      Alert.alert('Cadastro', 'Informe o nome da pizza.');
    }

    if (!description.trim()) {
      Alert.alert('Cadastro', 'Informe o descrição da pizza.');
    }

    if (!image) {
      Alert.alert('Cadastro', 'Seleciona a imagem da pizza.');
    }

    if (!priceSizeP || !priceSizeM || !priceSizeG) {
      Alert.alert('Cadastro', 'Informe o preço de todos os tamanhos da pizza.');
    }

    setIsLoading(true);

    const fileName = new Date().getTime();
    const reference = storage().ref(`/pizzas/${fileName}.png`)

    await reference.putFile(image);
    const photo_url = await reference.getDownloadURL();

    firestore()
      .collection('pizzas')
      .add({
        name,
        name_insensitive: name.toLocaleLowerCase().trim(),
        description,
        prices_sizes: {
          p: priceSizeP,
          m: priceSizeM,
          g: priceSizeG
        },
        photo_url,
        photo_path: reference.fullPath
      })
      .then(() => navigation.navigate('home'))
      .catch(() => {
        setIsLoading(false);
        Alert.alert('Cadastro', 'Não foi possível cadastrar a pizza.');
      })

  }

  async function handleUpdate() {
    if (!name.trim()) {
      Alert.alert('Cadastro', 'Informe o nome da pizza.');
    }

    if (!description.trim()) {
      Alert.alert('Cadastro', 'Informe o descrição da pizza.');
    }

    if (!image) {
      Alert.alert('Cadastro', 'Seleciona a imagem da pizza.');
    }

    if (!priceSizeP || !priceSizeM || !priceSizeG) {
      Alert.alert('Cadastro', 'Informe o preço de todos os tamanhos da pizza.');
    }

    setIsLoading(true);

    let data: any = {
      name,
      name_insensitive: name.toLocaleLowerCase().trim(),
      description,
      prices_sizes: {
        p: priceSizeP,
        m: priceSizeM,
        g: priceSizeG
      },
    }

    if (newImage !== '') {
      await deletePhoto();

      const fileName = new Date().getTime();
      const reference = storage().ref(`/pizzas/${fileName}.png`)

      await reference.putFile(newImage);
      const photo_url = await reference.getDownloadURL();

      data = {
        ...data,
        photo_url,
        photo_path: reference.fullPath
      }
    }

    firestore()
      .collection('pizzas')
      .doc(id)
      .update(data)
      .then(() => navigation.navigate('home'))
      .catch(() => {
        setIsLoading(false);
        Alert.alert('Cadastro', 'Não foi possível atualizar o cadastro da pizza.');
      })
  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert('Cadastro', `Deseja excluir a pizza ${name}?`, [
      {
        text: "Não",
        style: "cancel",
      },
      {
        text: "Sim",
        onPress: () => {
          firestore()
            .collection('pizzas')
            .doc(id)
            .delete()
            .then(() => {
              storage()
                .ref(photoPath)
                .delete()
                .then(() => navigation.navigate('home'))
            });
        },
      },
    ])


  }

  async function deletePhoto() {
    storage()
    .ref(photoPath)
    .delete();
  }

  useEffect(() => {
    if (id) {
      firestore()
        .collection('pizzas')
        .doc(id)
        .get()
        .then(response => {
          const product = response.data() as PizzaResponse;

          setName(product.name);
          setImage(product.photo_url);
          setPhotoPath(product.photo_path);
          setDescription(product.description);
          setPriceSizeP(product.prices_sizes.p);
          setPriceSizeM(product.prices_sizes.m);
          setPriceSizeG(product.prices_sizes.g);

          setDescriptionLength(String(product.description.length))
        })
    }

  }, [id])

  return (
    <Container behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <ButtonBack onPress={handleGoBack} />

          <Title>Cadastrar</Title>

          {id ?
            (<TouchableOpacity onPress={handleDelete}>
              <DeleteLabel>Deletar</DeleteLabel>
            </TouchableOpacity>)
            : <View style={{ width: 20 }} />}
        </Header>

        <Upload>
          <Photo uri={newImage === '' ? image : newImage} />
          <PickImageButton
            title={id ? "Atualizar foto" : "Carregar"}
            type="secondary"
            onPress={() => {
              handlePickerImage();

            }}
          />
        </Upload>

        <Form>
          <InputGroup>
            <Label>Nome</Label>
            <Input onChangeText={setName} value={name} />
          </InputGroup>

          <InputGroup>
            <InputGroupHeader>
              <Label>Descrição</Label>
              <MaxCharacteres>{descriptionLength} de 60 caracteres</MaxCharacteres>
            </InputGroupHeader>

            <Input
              multiline
              maxLength={60}
              style={{ height: 80 }}
              onChangeText={(text) => {
                setDescription(text)
                setDescriptionLength(String(text.length))
              }}
              value={description}
            />
          </InputGroup>

          <InputGroup>
            <Label>Tamanhos e preços</Label>

            <InputPrice size="P" onChangeText={setPriceSizeP} value={priceSizeP} />
            <InputPrice size="M" onChangeText={setPriceSizeM} value={priceSizeM} />
            <InputPrice size="G" onChangeText={setPriceSizeG} value={priceSizeG} />
          </InputGroup>

          {
            !id ?
              (<Button
                title="Cadastrar pizza"
                isLoading={isLoading}
                onPress={handleAdd}
              />) :
              (<Button
                title="Atualizar cadastro"
                isLoading={isLoading}
                onPress={handleUpdate}
              />)}

        </Form>
      </ScrollView>
    </Container>
  );
}
