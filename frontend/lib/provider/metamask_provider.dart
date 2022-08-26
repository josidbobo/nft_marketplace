import 'package:flutter_web3/flutter_web3.dart';
import 'package:flutter/material.dart';

class MetaMaskProvider extends ChangeNotifier {
  static const operatingChain = 4;

  String currentAddress = "";

  int currentChain = -1;

  bool rejected = false;
  bool ddisconnect = false;

  String get address => currentAddress;

  bool get isEnabled => ethereum != null;

  bool get isOperatingChain => currentChain == operatingChain;

  bool get isConnected => isEnabled && currentAddress.isNotEmpty;

  Future<void> connect() async {
    if (isEnabled) {
      final accounts = await ethereum!.requestAccount();

      if (accounts.isNotEmpty) {
        currentAddress = accounts.first;
        currentChain = await ethereum!.getChainId();
        print(currentAddress);
      }

      notifyListeners();
    }
  }

  Future<void> disconnect() async {
    await connect();
    //final acc = await ethereum!.request("wallet_requestPermissions", [ethereum!.requestAccount()]);

    // try {
    //   if (currentAddress.isEmpty) {
    //     final accounts = await ethereum!.requestAccount();

    //     if (accounts.isNotEmpty) {
    //       currentAddress = accounts.first;
    //       currentChain = await ethereum!.getChainId();
    //       print(currentAddress);
    //     }
    //   }
    // } catch (e) {
    //   rejected = true;
    //   notifyListeners();
    //   print(e.toString());
    // }
    notifyListeners();
  }

  clear() {
    currentAddress = "";
    currentChain = -1;
    notifyListeners();
  }

  init() {
    if (isEnabled) {
      ethereum!.onAccountsChanged((accounts) {
        clear();
      });
      ethereum!.onChainChanged((accounts) {
        clear();
      });
    }
  }
}
