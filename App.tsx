import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import { Appbar, IconButton, Dialog, TextInput, Button } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Camera, CameraCapturedPicture, PermissionResponse } from 'expo-camera';
import { useRef, useState } from 'react';
import Icon from '@mdi/react';
import { mdiWindowClose } from '@mdi/js';


interface Kuvaustiedot {
  kuvaustila: boolean;
  virhe: string;
  kuva?: CameraCapturedPicture;
  kohteenNimi: string;
  dialogiNakyvissa: boolean;
  info: string;
}

const App: React.FC = (): React.ReactElement => {
  const kameraRef: React.RefObject<Camera> = useRef<Camera>(null);

  const [kuvaustiedot, setKuvaustiedot] = useState<Kuvaustiedot>({
    kuvaustila: false,
    virhe: "",
    kohteenNimi: "",
    dialogiNakyvissa: false,
    info: "",
  });

  const kaynnistaKamera = async (): Promise<void> => {
    const kameralupa: PermissionResponse = await Camera.requestCameraPermissionsAsync();
    console.log(kameralupa);
    setKuvaustiedot({
      ...kuvaustiedot,
      kuvaustila: kameralupa.granted,
      virhe: kameralupa.granted ? '' : 'Ei lupaa käyttää kameraa',
    });
  };

  const tallennaKuvaNimi = (): void => {
    if (kuvaustiedot.kohteenNimi.trim() !== '') {
      setKuvaustiedot({ ...kuvaustiedot, dialogiNakyvissa: false });
    } else {
      Alert.alert('Virhe', 'Nimi ei voi olla tyhjä.');
    }
  };

  const otaKuva = async (): Promise<void> => {
    setKuvaustiedot({
      ...kuvaustiedot,
      info: "Odota hetki...",
    });

    try {
      if (kameraRef.current) {
        const capturedImage = await kameraRef.current.takePictureAsync();
        setKuvaustiedot({
          ...kuvaustiedot,
          kuvaustila: false,
          kuva: capturedImage,
          info: "",
          dialogiNakyvissa: true,
        });
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      setKuvaustiedot({
        ...kuvaustiedot,
        info: "Virhe kuvan ottamisessa",
      });
    }
  };
  const peruutaKuvaus = (): void => {
    setKuvaustiedot({
      ...kuvaustiedot,
      kuvaustila: false,
      info: "",
    });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {kuvaustiedot.kuvaustila ? (
          <Camera style={styles.kuvaustila} ref={kameraRef}>
            <IconButton
              icon="arrow-right-bottom-bold"
              size={30}
              style={styles.nappiPeruuta}
              onPress={peruutaKuvaus}
            />
            <IconButton
              icon="camera"
              size={30}
              onPress={otaKuva}
            />
          </Camera>
        ) : (
          <>
            <Appbar.Header>
              <Appbar.Content title="KameraSovellus" />
              <Appbar.Action icon="camera" onPress={kaynnistaKamera} />
            </Appbar.Header>

            <View style={styles.container}>
              {Boolean(kuvaustiedot.virhe) ? <Text>{kuvaustiedot.virhe}</Text> : null}
              {Boolean(kuvaustiedot.kuva) ? (
                <Image style={styles.kuva} source={{ uri: kuvaustiedot.kuva?.uri || '' }} />
              ) : null}

              {Boolean(kuvaustiedot.kohteenNimi) ? (
                <View style={styles.kuvatekstiContainer}>
                  <Text style={styles.kuvateksti}>{kuvaustiedot.kohteenNimi}</Text>
                </View>
              ) : null}


              <Dialog
                visible={kuvaustiedot.dialogiNakyvissa}
                onDismiss={() => setKuvaustiedot({ ...kuvaustiedot, dialogiNakyvissa: false })}
              >
                <Dialog.Title>Anna kohteen nimi</Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    label="Kohteen nimi"
                    value={kuvaustiedot.kohteenNimi}
                    onChangeText={(text) =>
                      setKuvaustiedot({ ...kuvaustiedot, kohteenNimi: text })
                    }
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={tallennaKuvaNimi}>Tallenna</Button>
                </Dialog.Actions>
              </Dialog>
            </View>
          </>
        )}
      </View>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    marginTop: 30,
  },
  kuvaustila: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  nappiPeruuta: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  kuva: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  kuvatekstiContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  kuvateksti: {
    fontSize: 16,
  },
});

export default App;