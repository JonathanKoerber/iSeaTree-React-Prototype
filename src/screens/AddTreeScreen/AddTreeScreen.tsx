import React from 'react'

import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Modal,
  Image,
  Alert,
  ScrollView,
} from 'react-native'
import { Button, TextInput, Text, Subheading, useTheme } from 'react-native-paper'
import Constants from 'expo-constants'
import { useFormik, FormikErrors } from 'formik'

import { CameraWithLocation } from '../../components/CameraWithLocation'
import { colors } from '../../styles/theme'
import { SpeciesSelect } from './SpeciesSelect'
import { TreeTypeSelect } from './TreeTypeSelect'
import { LandUseCategoriesSelect } from './LandUseCategoriesSelect'
import { Species, TreeTypes } from '../../lib/treeData'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Constants.statusBarHeight,
  },
})

interface FormValues {
  photo: null | {
    width: number
    height: number
    uri: string
  }
  coords: null | { latitude: number; longitude: number }
  speciesType: Species
  speciesNameId: null | number
  treeType: TreeTypes
  dbh: string
  notes: string
  landUseCategory: string | null
}

function validateForm(values: FormValues): FormikErrors<FormValues> {
  const errors: FormikErrors<FormValues> = {}

  if (!values.photo) {
    errors.photo = 'You have to add photo'
  }

  if (!values.dbh) {
    errors.dbh = "Can't be blank"
  }

  if (!values.speciesNameId) {
    errors.speciesNameId = "Can't be blank"
  }

  return errors
}

export function AddTreeScreen() {
  const [isCameraVisible, setIsCameraVisible] = React.useState<boolean>(false)
  const theme = useTheme()

  function handleClear() {
    Alert.alert('', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Yes, clear all',
        onPress: () => {
          formik.resetForm()
        },
      },
    ])
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      photo: null,
      coords: null,
      speciesType: Species.COMMON,
      speciesNameId: null,
      dbh: '',
      notes: '',
      treeType: TreeTypes.CONIFER,
      landUseCategory: null,
    },
    validate: validateForm,
    onSubmit: (values) => {
      setTimeout(() => {
        console.log('values:', values)
        formik.setSubmitting(false)
      }, 2000)
    },
  })

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 70 }}>
        <Button
          style={{ alignSelf: 'flex-end', marginVertical: 5 }}
          icon="close"
          onPress={handleClear}
        >
          Clear
        </Button>

        <View>
          <View
            style={{
              backgroundColor: colors.gray[200],
              height: 220,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {!!formik.values.photo && (
              <Image
                style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
                source={{ uri: formik.values.photo.uri }}
              />
            )}

            {!formik.values.photo && (
              <MaterialCommunityIcons name="image" size={60} color={colors.gray[400]} />
            )}
          </View>

          <Button
            onPress={() => {
              setIsCameraVisible(true)
            }}
            icon="camera"
            mode="outlined"
            style={{ borderRadius: 0 }}
          >
            Add photo
          </Button>
        </View>

        {!!formik.errors.photo && !!formik.touched.photo && (
          <Text style={{ color: theme.colors.error, marginLeft: 15, marginTop: 5 }}>
            {formik.errors.photo}
          </Text>
        )}

        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <SpeciesSelect
            speciesNameId={formik.values.speciesNameId}
            speciesType={formik.values.speciesType}
            onSelect={(data) => {
              console.log('species select: ', data)

              if (data) {
                formik.setValues({
                  ...formik.values,
                  speciesNameId: data.speciesNameId,
                  speciesType: data.speciesType,
                })
              } else {
                formik.setValues({
                  ...formik.values,
                  speciesNameId: null,
                  speciesType: Species.COMMON,
                })
              }
            }}
          />

          {!!formik.errors.speciesNameId && !!formik.touched.speciesNameId && (
            <Text style={{ color: theme.colors.error, marginTop: 5 }}>
              {formik.errors.speciesNameId}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <Subheading>DBH (in)</Subheading>
          <TextInput
            placeholder="Diameter at breast height"
            mode="outlined"
            keyboardType="numeric"
            value={formik.values.dbh}
            onChangeText={(value) => {
              formik.setFieldValue('dbh', value)
            }}
          />

          {!!formik.errors.dbh && !!formik.touched.dbh && (
            <Text style={{ color: theme.colors.error, marginTop: 5 }}>{formik.errors.dbh}</Text>
          )}
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <Subheading>Dominant Surrounding Land Use</Subheading>
          <LandUseCategoriesSelect
            landUseCategoryName={formik.values.landUseCategory}
            onValueChange={(value) => {
              formik.setFieldValue('landUseCategory', value)
            }}
          />
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <Subheading>Notes</Subheading>
          <TextInput
            placeholder="Your notes..."
            mode="outlined"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            scrollEnabled={false}
            value={formik.values.notes}
            onChangeText={(value) => {
              formik.setFieldValue('notes', value)
            }}
          />
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 15 }}>
          <TreeTypeSelect />
        </View>

        <View style={{ marginTop: 50, paddingHorizontal: 15 }}>
          {!formik.isValid && (
            <Text style={{ color: theme.colors.error, marginBottom: 5 }}>
              Please take a look at the above error messages
            </Text>
          )}

          <Button mode="contained" onPress={formik.handleSubmit} loading={formik.isSubmitting}>
            Save
          </Button>
        </View>

        <Modal visible={isCameraVisible} animationType="slide">
          <CameraWithLocation
            onClose={() => {
              setIsCameraVisible(false)
            }}
            onTakePictureFinish={({ capturedPicture, location }) => {
              const coords: FormValues['coords'] = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }

              const photo: FormValues['photo'] = {
                width: capturedPicture.width,
                height: capturedPicture.height,
                uri: capturedPicture.uri,
              }

              formik.setValues({ ...formik.values, coords, photo })
              setIsCameraVisible(false)
            }}
          />
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
