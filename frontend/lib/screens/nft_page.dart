import "package:flutter/material.dart";
import 'package:fluttertoast/fluttertoast.dart';
import 'package:nft_minting_app/provider/metamask_provider.dart';
import 'package:nft_minting_app/provider/upload_provider.dart';
import 'package:nft_minting_app/widgets/show_textField.dart';
import 'package:provider/provider.dart';

class NftPage extends StatefulWidget {
  NftPage({Key? key}) : super(key: key);

  @override
  State<NftPage> createState() => _NftPageState();
}

class _NftPageState extends State<NftPage> {
  final nameController = TextEditingController();
  final descriptionController = TextEditingController();

  void _showDialog(context) {
    showDialog(
        barrierDismissible: true,
        context: context,
        builder: (_) {
          return ChangeNotifierProvider(
              create: (context) => UploadProvider(),
              builder: (context, child) {
                return Dialog(
                  child: SizedBox(
                    height: 310,
                    width: 710, 
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Consumer<UploadProvider>(
                          builder: ((context, provider, child) {
                            late Widget title;
                            provider.isUnAssigned
                                ? title = Image.asset("assets/market.png")
                                : provider.isWeb
                                    ? title = Image.memory(context
                                        .watch<UploadProvider>()
                                        .webImage)
                                    : title = Image.file(context
                                        .watch<UploadProvider>()
                                        .getFile);
                            return SizedBox(
                              height: 95,
                              child: ListTile(
                                leading: ElevatedButton(
                                  onPressed: () => context
                                      .read<UploadProvider>()
                                      .uploadImage(),
                                  child: const Text("Upload"),
                                ),
                                title: title,
                              ),
                            );
                          }),
                        ),
                        TextView(text: 'name', controller: nameController),
                        TextView(
                            text: 'description',
                            controller: descriptionController),
                        Consumer<UploadProvider>(
                            builder: (context, provider, child) {
                          if (provider.isLoading) {
                            return const ListTile(
                                trailing: CircularProgressIndicator(
                              color: Colors.black54,
                            ));
                          }
                          return ListTile(
                            trailing: ElevatedButton( 
                              onPressed: () {},
                              child: const Text("Upload To IPFS"),
                            ),
                          );
                        })
                      ],
                    ),
                  ),
                );
              });
        });
  }

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

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
        providers: [
          ChangeNotifierProvider<MetaMaskProvider>(
              create: (context) => MetaMaskProvider()..connect()),
          ChangeNotifierProvider<UploadProvider>(
              create: (context) => UploadProvider())
        ],
        builder: (context, child) {
          return Scaffold(
            body: SafeArea(
              child: SingleChildScrollView(
                  padding: EdgeInsets.only(
                      right: MediaQuery.of(context).size.width * 0.21,
                      left: MediaQuery.of(context).size.width * 0.21),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Consumer<MetaMaskProvider>(
                              builder: (context, provider, child) {
                            return Container(
                                width: MediaQuery.of(context).size.width * 0.25,
                                height: 24,
                                padding:
                                    const EdgeInsets.only(top: 5, bottom: 5),
                                child: Text(context.watch<MetaMaskProvider>().currentAddress));
                          }),
                          SizedBox(
                            width: MediaQuery.of(context).size.width * 0.03,
                          ),
                          Container(
                            width: MediaQuery.of(context).size.width * 0.07,
                            padding: const EdgeInsets.only(top: 4, bottom: 5),
                            child: Consumer<MetaMaskProvider>(
                                builder: (context, provider, child) {
                              return ElevatedButton(
                                onPressed: () {
                                  context.read<MetaMaskProvider>().disconnect();
                                  if(!provider.isConnected && !provider.isOperatingChain){  
                                  Navigator.of(context)
                                      .pushReplacementNamed("/");
                                      }
                                },
                                style: ElevatedButton.styleFrom(
                                    primary:
                                        const Color.fromRGBO(33, 150, 243, 1)),
                                child: const Text('Disconnect'),
                              );
                            }),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          SizedBox(
                            height: 43,
                            child: ElevatedButton(
                              onPressed: () => _showDialog(context),
                              style: ElevatedButton.styleFrom(
                                  primary: Color.fromRGBO(41, 162, 91, 1)),
                              child: const Text('Create NFT'),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        height: MediaQuery.of(context).size.width * 0.09,
                      ),
                      Container(
                          height: 1700,
                          width: 960,
                          child: Card(
                            elevation: 4,
                            color: Colors.grey[350],
                            child: GridView(
                              padding: const EdgeInsets.all(8),
                              gridDelegate:
                                  SliverGridDelegateWithMaxCrossAxisExtent(
                                // width of the Grid.
                                maxCrossAxisExtent:
                                    MediaQuery.of(context).size.width * 0.38,
                                // How the items should be sized regarding their height and width relation.
                                childAspectRatio: 4 / 2,
                                // spacing between them cross wise.
                                crossAxisSpacing: 15,
                                // spacing between them main wise ie down the GRID.
                                mainAxisSpacing: 15,
                              ),
                              children: const [
                                Text("Na here we dey my boss"),
                                Text("Oya turn up o")
                              ],
                            ),
                          )),
                      const SizedBox(
                        height: 24,
                      )
                    ],
                  )),
            ),
          );
        });
  }
}
