import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useState } from "react";
import icons from "../constants/icons";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={` space-y-1 ${otherStyles}`}>
      <Text className="text-base text-gray-800 font-psemibold ">{title}</Text>
      <View className=" border-2 border-blue-400 w-full h-14 px-4 bg-slate-100 rounded-xl focus:border-secondary items-center flex-row">
        <TextInput
          className="flex-1 text-black-100 font-pregular text-xl"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7b7b8b"
          onChangeText={handleChangeText}
          secureTextEntry={(title === "Password" || title === "Confirm Password") && !showPassword}
        />

        {(title === "Password" || title === "Confirm Password")  && (
          <TouchableOpacity
            onPress={() => {
              setShowPassword(!showPassword);
            }}
          >
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6 "
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
