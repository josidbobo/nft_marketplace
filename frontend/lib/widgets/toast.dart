import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';


  void showToast(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.values[3],
      gravity: ToastGravity.TOP,
      timeInSecForIosWeb: 3,
      backgroundColor: const Color.fromRGBO(132, 57, 52, 1),
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }
