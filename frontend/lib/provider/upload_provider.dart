import 'dart:convert';
import 'dart:typed_data';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../widgets/toast.dart';
import 'package:http/http.dart' as http;

class UploadProvider extends ChangeNotifier {
  File _file = File("zz");
  Uint8List webImage = Uint8List(10);
  bool loading = false;
  bool get isLoading => loading ? true : false;

  bool get isUnAssigned => _file.path == "zz";
  bool get isWeb => kIsWeb ? true : false;
  File get getFile => _file;

  var url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  Future<PermissionStatus> requestPermissions() async {
    await Permission.photos.request();
    return Permission.photos.status;
  }

  uploadImage() async {
    // MOBILE
    if (!kIsWeb) {
      var permissionStatus = requestPermissions();
      if (await permissionStatus.isGranted) {
        final ImagePicker _picker = ImagePicker();
        XFile? image = await _picker.pickImage(source: ImageSource.gallery);
        if (image != null) {
          var selected = File(image.path);
          _file = selected;
        } else {
          showToast("No file selected");
        }
      }
    }
    // WEB
    else if (kIsWeb) {
      final ImagePicker _picker = ImagePicker();
      XFile? image = await _picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        var f = await image.readAsBytes();
        _file = File("a");
        webImage = f;
      } else {
        showToast("No file selected");
      }
    } else {
      showToast("Permission not granted");
    }
    notifyListeners();
  }


  // Future<http.Response> imageToIpfs() async {
  //   File newFile = File(webImage);
  //   try {
  //     loading = true;
  //     notifyListeners();
  //     var r = await http.post(Uri.parse( url), headers: {
  //       'ContentType': 'multipart/formdata',
  //       'pinata-api-key': 'a91b74377781c2d46e20',
  //       'pinata-secret-api-key':
  //           '695951bbe0b03dac775476c9be89635513f7e5925b9894dc803011cbac27dbf5',
  //     }, body: {
  //        newImage
  //     });
  //     // await Future.delayed(const Duration(seconds: 5));
  //     loading = false;
  //     notifyListeners();
  //     return r;
  //   } catch (e) {
  //     print(e.toString());
  //     throw e;
  //   }
  // }
}
