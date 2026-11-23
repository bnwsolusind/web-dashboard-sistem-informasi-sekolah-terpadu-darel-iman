/**
 * Data Wilayah Indonesia — Provinsi → Kota/Kabupaten → Kecamatan → Kelurahan/Desa
 * Digunakan untuk cascading dropdown pada StudentFormModal
 */

const WILAYAH_DATA = [
 {
 provinsi: 'Sumatera Barat',
 kotaList: [
 { nama: 'Kota Padang', kecamatanList: [
 { nama: 'Bungus Teluk Kabung', kelurahanList: ['Bungus Barat', 'Bungus Selatan', 'Bungus Timur', 'Teluk Kabung Selatan', 'Teluk Kabung Tengah', 'Teluk Kabung Utara'] },
 { nama: 'Koto Tangah', kelurahanList: ['Air Pacah', 'Balai Gadang', 'Batang Kabung Ganting', 'Dadok Tunggul Hitam', 'Koto Panjang Ikur Koto', 'Koto Pulai', 'Lubuk Buaya', 'Lubuk Minturun', 'Parupuk Tabing', 'Pasie Nan Tigo'] },
 { nama: 'Kuranji', kelurahanList: ['Ampang', 'Anduring', 'Kalumbuk', 'Korong Gadang', 'Kuranji', 'Lubuk Lintah', 'Pasar Ambacang', 'Sungai Sapih'] },
 { nama: 'Lubuk Begalung', kelurahanList: ['Batu Gadang', 'Cengkeh Nan XX', 'Gates Nan XX', 'Kampung Baru Nan XX', 'Koto Baru Nan XX', 'Lubuk Begalung Nan XX', 'Pagambiran Ampalu Nan XX', 'Pampangan Nan XX', 'Tanjung Aur Nan XX'] },
 { nama: 'Lubuk Kilangan', kelurahanList: ['Bandar Buat', 'Batu Gadang', 'Indarung', 'Koto Lalang', 'Padang Besi', 'Tarantang'] },
 { nama: 'Nanggalo', kelurahanList: ['Gurun Laweh Nan XX', 'Kampung Lapai', 'Kampung Olo', 'Kurao Pagang', 'Surau Gadang', 'Tabing Banda Gadang'] },
 { nama: 'Padang Barat', kelurahanList: ['Belakang Tangsi', 'Berok Nipah', 'Kampung Jao', 'Kampung Pondok', 'Purus', 'Rimbo Kaluang', 'Ujung Gurun'] },
 { nama: 'Padang Selatan', kelurahanList: ['Air Manis', 'Alang Laweh', 'Batang Arau', 'Bukit Gado-Gado', 'Mata Air', 'Rawang', 'Seberang Padang', 'Seberang Palinggam', 'Teluk Bayur'] },
 { nama: 'Padang Timur', kelurahanList: ['Andalas', 'Belakang Pondok', 'Ganting Parak Gadang', 'Jati', 'Jati Baru', 'Kubu Marapalam', 'Parak Gadang Timur', 'Sawahan', 'Sawahan Timur'] },
 { nama: 'Padang Utara', kelurahanList: ['Air Tawar Barat', 'Air Tawar Timur', 'Alai Parak Kopi', 'Gunung Pangilun', 'Lolong Belanti', 'Ulak Karang Selatan', 'Ulak Karang Utara'] },
 { nama: 'Pauh', kelurahanList: ['Binuang Kampung Dalam', 'Cupak Tangah', 'Kapalo Koto', 'Koto Luar', 'Lambung Bukit', 'Limau Manis', 'Limau Manis Selatan', 'Pisang'] }
 ]},
 { nama: 'Kota Bukittinggi', kecamatanList: [
 { nama: 'Guguk Panjang', kelurahanList: ['Bukit Cangang Kayu Ramang', 'Pakan Kurai', 'Tarok Dipo', 'Aur Tajungkang Tengah Sawah', 'Benteng Pasar Atas'] },
 { nama: 'Mandiangin Koto Selayan', kelurahanList: ['Campago Guguak Bulek', 'Campago Ipuh', 'Garegeh', 'Koto Selayan', 'Kubu Gulai Bancah', 'Pulai Anak Air', 'Puhun Pintu Kabun', 'Puhun Tembok'] },
 { nama: 'Aur Birugo Tigo Baleh', kelurahanList: ['Aur Kuning', 'Belakang Balok', 'Birugo', 'Kubu Tanjung', 'Ladang Cakiah', 'Sapiran', 'Pariangan'] }
 ]},
 { nama: 'Kota Payakumbuh', kecamatanList: [
 { nama: 'Payakumbuh Barat', kelurahanList: ['Daya Bangun', 'Ibuah', 'Koto Nan Gadang', 'Parit Rantang', 'Sarilamak', 'Tanjung Pauh'] },
 { nama: 'Payakumbuh Selatan', kelurahanList: ['Balai Nan Duo', 'Koto Baru', 'Ranah', 'Sawah Padang'] },
 { nama: 'Payakumbuh Timur', kelurahanList: ['Balai Jariang', 'Koto Panjang', 'Padang Tangah', 'Payolansek', 'Talang'] },
 { nama: 'Payakumbuh Utara', kelurahanList: ['Bulakan Balai Kandi', 'Langsat Kadap', 'Labuh Baru', 'Padang Kaduduak', 'Taluk'] },
 { nama: 'Lamposi Tigo Nagori', kelurahanList: ['Koto Tangah Batu Hampar', 'Kubu Gadang', 'Lamposi', 'Sungai Durian', 'Tiakar'] }
 ]},
 { nama: 'Kota Solok', kecamatanList: [
 { nama: 'Lubuk Sikarah', kelurahanList: ['Aro IV Korong', 'IX Korong', 'KTK', 'Lubuk Sikarah', 'Sinapa Piliang', 'Tanah Garam', 'VI Suku'] },
 { nama: 'Tanjung Harapan', kelurahanList: ['Kampai Tabu Karambia', 'Koto Panjang', 'Laing', 'Nan Balimo', 'PPA', 'Tanjung Paku'] }
 ]},
 { nama: 'Kota Pariaman', kecamatanList: [
 { nama: 'Pariaman Barat', kelurahanList: ['Desa Apar', 'Desa Bato', 'Desa Cubadak'] },
 { nama: 'Pariaman Selatan', kelurahanList: ['Kurai Taji', 'Pauh Barat', 'Pauh Timur'] },
 { nama: 'Pariaman Timur', kelurahanList: ['Kampung Baru', 'Kampung Perak', 'Naras Hilir'] },
 { nama: 'Pariaman Utara', kelurahanList: ['Ampalu', 'Mangguang', 'Sintuk'] }
 ]},
 { nama: 'Kota Padang Panjang', kecamatanList: [
 { nama: 'Padang Panjang Barat', kelurahanList: ['Bukit Surungan', 'Kampung Manggis', 'Pasar Usang', 'Silaing Bawah', 'Tanah Hitam'] },
 { nama: 'Padang Panjang Timur', kelurahanList: ['Ekor Lubuk', 'Ganting', 'Guguk Malintang', 'Koto Katik', 'Ngalau', 'Sigando', 'Silaing Atas', 'Tanah Pak Lambik'] }
 ]},
 { nama: 'Kota Sawahlunto', kecamatanList: [
 { nama: 'Barangin', kelurahanList: ['Kolok Nan Duo', 'Sikalang', 'Talawi Hilir'] },
 { nama: 'Lembah Segar', kelurahanList: ['Durian', 'Pasar', 'Rantih'] },
 { nama: 'Silungkang', kelurahanList: ['Muaro Kalaban', 'Silungkang Duo', 'Silungkang Oso', 'Silungkang Tigo'] },
 { nama: 'Talawi', kelurahanList: ['Kumbayau', 'Salak', 'Talawi Hilir', 'Talawi Mudik'] }
 ]},
 { nama: 'Kab. Padang Pariaman', kecamatanList: [
 { nama: '2x11 Enam Lingkung', kelurahanList: ['Koto Tinggi', 'Parit Malintang', 'Sicincin'] },
 { nama: '2x11 Kayu Tanam', kelurahanList: ['Anduring', 'Kapalo Hilalang', 'Kayu Tanam'] },
 { nama: 'Batang Anai', kelurahanList: ['Kasang', 'Ketaping', 'Sungai Buluh'] },
 { nama: 'Batang Gasan', kelurahanList: ['Batu Kalang', 'Gasan Gadang', 'Sungai Asam'] },
 { nama: 'Enam Lingkung', kelurahanList: ['Koto Tinggi', 'Parit Malintang'] },
 { nama: 'IV Koto Aur Malintang', kelurahanList: ['Aur Malintang', 'Balah Aia', 'Koto Baru'] },
 { nama: 'Lubuk Alung', kelurahanList: ['Lubuk Alung', 'Pacung', 'Pasir Laweh'] },
 { nama: 'Nan Sabaris', kelurahanList: ['Aie Tajun', 'Kapuh', 'Sunur'] },
 { nama: 'Padang Sago', kelurahanList: ['Guguak', 'Lubuk Jantan', 'Padang Sago'] },
 { nama: 'Patamuan', kelurahanList: ['Campago', 'Kapundung', 'Patamuan'] },
 { nama: 'Sintuk Toboh Gadang', kelurahanList: ['Katapiang', 'Sintuk', 'Toboh Gadang'] },
 { nama: 'Sungai Geringging', kelurahanList: ['Batu Hampar', 'Kuranji Hilir', 'Sungai Geringging'] },
 { nama: 'Sungai Limau', kelurahanList: ['Asam Kumbang', 'Koto Hilalang', 'Sungai Limau'] },
 { nama: 'V Koto Kampung Dalam', kelurahanList: ['Koto Dalam', 'Limau Purut', 'Sungai Asam'] },
 { nama: 'V Koto Timur', kelurahanList: ['Koto Baru', 'Limau Sundai', 'Sungai Sariak'] },
 { nama: 'VII Koto Sungai Sarik', kelurahanList: ['Batu Basa', 'Padang Laweh', 'Sungai Sarik'] }
 ]},
 { nama: 'Kab. Agam', kecamatanList: [
 { nama: 'Ampek Angkek', kelurahanList: ['Balai Gurah', 'Biaro Gadang', 'Lambah'] },
 { nama: 'Ampek Nagari', kelurahanList: ['Bawan', 'Durian Gadang', 'Sitalang'] },
 { nama: 'Banuhampu', kelurahanList: ['Cingkariang', 'Ladang Laweh', 'Pakan Sinayan'] },
 { nama: 'Baso', kelurahanList: ['Baso', 'Koto Baru', 'Tabek Panjang'] },
 { nama: 'Canduang', kelurahanList: ['Bukik Batabuah', 'Canduang Koto Laweh', 'Lasi'] },
 { nama: 'Kamang Magek', kelurahanList: ['Kamang Hilir', 'Kamang Mudik', 'Magek'] },
 { nama: 'Lubuk Basung', kelurahanList: ['Kampung Pinang', 'Lubuk Basung', 'Manggopoh'] },
 { nama: 'Malalak', kelurahanList: ['Malalak Barat', 'Malalak Selatan', 'Malalak Timur'] },
 { nama: 'Matur', kelurahanList: ['Matur Hilir', 'Matur Mudik', 'Tigo Koto Silungkang'] },
 { nama: 'Palembayan', kelurahanList: ['Baringin', 'Palembayan', 'Sungai Janiah'] },
 { nama: 'Palupuh', kelurahanList: ['Koto Rantang', 'Palupuh', 'Pasia Laweh'] },
 { nama: 'Sungai Pua', kelurahanList: ['Batu Palano', 'Padang Laweh', 'Sungai Pua'] },
 { nama: 'Tanjung Raya', kelurahanList: ['Bayur', 'Maninjau', 'Tanjung Sani'] },
 { nama: 'Tilatang Kamang', kelurahanList: ['Gadut', 'Kapau', 'Koto Tangah'] }
 ]},
 { nama: 'Kab. Tanah Datar', kecamatanList: [
 { nama: 'Batipuh', kelurahanList: ['Batipuh Baruah', 'Guguak Malalo', 'Pitalah'] },
 { nama: 'Batipuh Selatan', kelurahanList: ['Gunung Rajo', 'Sumpur', 'Tanjung Barulak'] },
 { nama: 'Limo Kaum', kelurahanList: ['Balimbing', 'Baringin', 'Lima Kaum'] },
 { nama: 'Lintau Buo', kelurahanList: ['Buo', 'Lintau', 'Pangian'] },
 { nama: 'Lintau Buo Utara', kelurahanList: ['Balai Tangah', 'Mungo', 'Tigo Jangko'] },
 { nama: 'Padang Ganting', kelurahanList: ['Atar', 'Padang Ganting', 'Sungayang'] },
 { nama: 'Pariangan', kelurahanList: ['Pariangan', 'Sawah Tangah', 'Tabek'] },
 { nama: 'Rambatan', kelurahanList: ['Rambatan', 'Simawang', 'Tigo Balai'] },
 { nama: 'Salimpuang', kelurahanList: ['Lawang Mandahiling', 'Salimpuang', 'Sumanik'] },
 { nama: 'Sungai Tarab', kelurahanList: ['Koto Baru', 'Padang Laweh', 'Sungai Tarab'] },
 { nama: 'Sungayang', kelurahanList: ['Andaleh', 'Minangkabau', 'Sungayang'] },
 { nama: 'Tanjung Emas', kelurahanList: ['Pagaruyung', 'Saruaso', 'Tanjung Emas'] },
 { nama: 'Tanjung Baru', kelurahanList: ['Barulak', 'Tanjung Baru'] },
 { nama: 'X Koto', kelurahanList: ['Koto Baru', 'Koto Hilalang', 'Pandai Sikek'] }
 ]},
 { nama: 'Kab. Pesisir Selatan', kecamatanList: [
 { nama: 'Bayan Batang Kapas', kelurahanList: ['Batang Kapas', 'Bayan'] },
 { nama: 'IV Jurai', kelurahanList: ['Painan', 'Salido', 'Sago'] },
 { nama: 'Lengayang', kelurahanList: ['Kambang', 'Lengayang', 'Surantih'] },
 { nama: 'Linggo Sari Baganti', kelurahanList: ['Air Haji', 'Lubuk Bunta', 'Sungai Tunu'] },
 { nama: 'Lunang', kelurahanList: ['Lunang', 'Sindang Lunang'] },
 { nama: 'Pancung Soal', kelurahanList: ['Inderapura', 'Pancung Soal'] },
 { nama: 'Ranah Ampek Tapan', kelurahanList: ['Lubuk Gadang', 'Tapan'] },
 { nama: 'Ranah Pesisir', kelurahanList: ['Kambang', 'Ranah Pesisir'] },
 { nama: 'Silaut', kelurahanList: ['Silaut', 'Sungai Pinang'] },
 { nama: 'Sutera', kelurahanList: ['Painan Selatan', 'Sutera'] },
 { nama: 'Taram', kelurahanList: ['Bayang', 'Taram'] },
 { nama: 'Trusan', kelurahanList: ['Batu Hampar', 'Trusan'] }
 ]},
 { nama: 'Kab. Solok', kecamatanList: [
 { nama: 'Bukit Sundi', kelurahanList: ['Dilam', 'Muaro Paneh', 'Sumpur'] },
 { nama: 'Danau Kembar', kelurahanList: ['Alahan Panjang', 'Paninjauan'] },
 { nama: 'Gunung Talang', kelurahanList: ['Batang Barus', 'Cupak', 'Talang'] },
 { nama: 'Kubung', kelurahanList: ['Gaung', 'Koto Hilalang', 'Selayo'] },
 { nama: 'Lembang Jaya', kelurahanList: ['Batu Bajanjang', 'Koto Anau', 'Salayo Tanang Bukit Sileh'] },
 { nama: 'Lembah Gumanti', kelurahanList: ['Alahan Panjang', 'Sungai Nanam'] },
 { nama: 'Payung Sekaki', kelurahanList: ['Aie Dingin', 'Sirukam'] },
 { nama: 'Pantai Cermin', kelurahanList: ['Koto Gadang', 'Surian'] },
 { nama: 'Tigo Lurah', kelurahanList: ['Aie Luo', 'Batu Bajanjang'] },
 { nama: 'X Koto Diatas', kelurahanList: ['Koto Baru', 'Paninggahan'] },
 { nama: 'X Koto Singkarak', kelurahanList: ['Saniang Baka', 'Sumani'] }
 ]},
 { nama: 'Kab. Pasaman', kecamatanList: [
 { nama: 'Bonjol', kelurahanList: ['Ganggo Hilia', 'Ganggo Mudik', 'Koto Kaciak'] },
 { nama: 'Dua Koto', kelurahanList: ['Cubadak', 'Koto Nopan', 'Tanjung Beringin'] },
 { nama: 'Lubuk Sikaping', kelurahanList: ['Aia Manggih', 'Durian Tinggi', 'Lubuk Sikaping'] },
 { nama: 'Mapat Tunggul', kelurahanList: ['Ladang Panjang', 'Mapat Tunggul Selatan'] },
 { nama: 'Panti', kelurahanList: ['Panti', 'Panti Selatan'] },
 { nama: 'Rao', kelurahanList: ['Padang Gelugur', 'Rao', 'Tanjung Betung'] }
 ]},
 { nama: 'Kab. Pasaman Barat', kecamatanList: [
 { nama: 'Kinali', kelurahanList: ['Kinali', 'Sasak', 'Sidodadi'] },
 { nama: 'Luhak Nan Duo', kelurahanList: ['Koto Baru', 'Sinuruik'] },
 { nama: 'Pasaman', kelurahanList: ['Aia Gadang', 'Lingkuang Aua'] },
 { nama: 'Ranah Batahan', kelurahanList: ['Batahan', 'Muara Kiawai'] },
 { nama: 'Sungai Aur', kelurahanList: ['Parik', 'Sungai Aur'] },
 { nama: 'Talamau', kelurahanList: ['Simpang Empat', 'Talu'] }
 ]},
 { nama: 'Kab. Limapuluh Kota', kecamatanList: [
 { nama: 'Akabiluru', kelurahanList: ['Banja Loweh', 'Mungo'] },
 { nama: 'Guguk', kelurahanList: ['Bukik Sikumpa', 'Guguk'] },
 { nama: 'Harau', kelurahanList: ['Harau', 'Taram', 'Tarantang'] },
 { nama: 'Kapur IX', kelurahanList: ['Koto Bangun', 'Muaro Paiti'] },
 { nama: 'Luak', kelurahanList: ['Batang Piaman', 'Luak'] },
 { nama: 'Lareh Sago Halaban', kelurahanList: ['Halaban', 'Situjuah'] },
 { nama: 'Pangkalan Koto Baru', kelurahanList: ['Koto Baru', 'Pangkalan'] },
 { nama: 'Payakumbuh', kelurahanList: ['Koto Tangah Batu Hampar', 'Simalanggang'] },
 { nama: 'Situjuah Limo Nagari', kelurahanList: ['Situjuah Gadang', 'Situjuah Batua'] }
 ]},
 { nama: 'Kab. Dharmasraya', kecamatanList: [
 { nama: 'Asam Jujuhan', kelurahanList: ['Lubuk Karak', 'Sungai Limau'] },
 { nama: 'Koto Baru', kelurahanList: ['Koto Baru', 'Siguntur'] },
 { nama: 'Koto Besar', kelurahanList: ['Koto Besar', 'Alam Pauh Duo'] },
 { nama: 'Koto Salak', kelurahanList: ['Koto Salak', 'Panyubarangan'] },
 { nama: 'Padang Laweh', kelurahanList: ['Padang Laweh', 'Sungai Duo'] },
 { nama: 'Pulau Punjung', kelurahanList: ['Pulau Punjung', 'Sungai Dareh'] },
 { nama: 'Sitiung', kelurahanList: ['Sitiung', 'Sungai Duo'] },
 { nama: 'Timpeh', kelurahanList: ['Ranah Palabi', 'Timpeh'] }
 ]},
 { nama: 'Kab. Solok Selatan', kecamatanList: [
 { nama: 'Koto Parik Gadang Diateh', kelurahanList: ['Koto Gadang', 'Alam Pauh Duo'] },
 { nama: 'Sangir', kelurahanList: ['Lubuk Gadang', 'Sangir'] },
 { nama: 'Sangir Balae Janggola', kelurahanList: ['Padang Aro', 'Sungai Kunyit'] },
 { nama: 'Sangir Jujuan', kelurahanList: ['Jujuan', 'Sungai Kunyit Barat'] },
 { nama: 'Sangir Batang Hari', kelurahanList: ['Lubuk Malako', 'Sako Utara'] }
 ]},
 { nama: 'Kab. Sijunjung', kecamatanList: [
 { nama: 'Koto VII', kelurahanList: ['Padang Sibusuk', 'Tanjung Ampalu'] },
 { nama: 'Kupitan', kelurahanList: ['Kupitan', 'Rantau Jambu'] },
 { nama: 'Lubuak Tarok', kelurahanList: ['Lubuak Tarok', 'Muaro'] },
 { nama: 'Sijunjung', kelurahanList: ['Muaro Sijunjung', 'Pematang Panjang'] },
 { nama: 'Sumpur Kudus', kelurahanList: ['Sumpur', 'Tanjung Bonai'] },
 { nama: 'Tanjung Gadang', kelurahanList: ['Tanjung Gadang', 'Sungai Betung'] }
 ]},
 { nama: 'Kab. Kepulauan Mentawai', kecamatanList: [
 { nama: 'Pagai Selatan', kelurahanList: ['Bulasat', 'Malakopa'] },
 { nama: 'Pagai Utara', kelurahanList: ['Sikakap', 'Sioban'] },
 { nama: 'Siberut Barat', kelurahanList: ['Saibi Samukop', 'Silabu'] },
 { nama: 'Siberut Selatan', kelurahanList: ['Maileppet', 'Muara Siberut'] },
 { nama: 'Sipora Selatan', kelurahanList: ['Bosua', 'Tuapejat'] },
 { nama: 'Sipora Utara', kelurahanList: ['Betumonga', 'Sipora Jaya'] }
 ]}
 ]
 },
 {
 provinsi: 'DKI Jakarta',
 kotaList: [
 { nama: 'Jakarta Selatan', kecamatanList: [
 { nama: 'Cilandak', kelurahanList: ['Cilandak Barat', 'Cipete Selatan', 'Gandaria Selatan', 'Lebak Bulus', 'Pondok Labu'] },
 { nama: 'Jagakarsa', kelurahanList: ['Ciganjur', 'Jagakarsa', 'Lenteng Agung', 'Srengseng Sawah', 'Tanjung Barat'] },
 { nama: 'Kebayoran Baru', kelurahanList: ['Gandaria Utara', 'Gunung', 'Kramat Pela', 'Melawai', 'Pulo', 'Selong', 'Senayan'] },
 { nama: 'Kebayoran Lama', kelurahanList: ['Cipulir', 'Grogol Selatan', 'Grogol Utara', 'Kebayoran Lama Selatan', 'Kebayoran Lama Utara', 'Pondok Pinang'] },
 { nama: 'Mampang Prapatan', kelurahanList: ['Bangka', 'Kuningan Barat', 'Mampang Prapatan', 'Pela Mampang', 'Tegal Parang'] },
 { nama: 'Pancoran', kelurahanList: ['Cikoko', 'Duren Tiga', 'Kalibata', 'Pancoran', 'Pengadegan', 'Rawajati'] },
 { nama: 'Pasar Minggu', kelurahanList: ['Cilandak Timur', 'Jati Padang', 'Kebagusan', 'Pejaten Barat', 'Pejaten Timur', 'Ragunan'] },
 { nama: 'Pesanggrahan', kelurahanList: ['Bintaro', 'Pesanggrahan', 'Ulujami'] },
 { nama: 'Setiabudi', kelurahanList: ['Guntur', 'Karet', 'Karet Kuningan', 'Karet Semanggi', 'Kuningan Timur', 'Menteng Atas', 'Pasar Manggis', 'Setiabudi'] },
 { nama: 'Tebet', kelurahanList: ['Bukit Duri', 'Kebon Baru', 'Manggarai', 'Manggarai Selatan', 'Menteng Dalam', 'Tebet Barat', 'Tebet Timur'] }
 ]},
 { nama: 'Jakarta Timur', kecamatanList: [
 { nama: 'Cakung', kelurahanList: ['Cakung Barat', 'Cakung Timur', 'Jatinegara Kaum', 'Penggilingan', 'Pulo Gebang', 'Pulogebang', 'Rawa Terate', 'Ujung Menteng'] },
 { nama: 'Cipayung', kelurahanList: ['Bambu Apus', 'Ceger', 'Cipayung', 'Cilangkap', 'Lubang Buaya', 'Munjul', 'Pondok Rangon', 'Setu'] },
 { nama: 'Ciracas', kelurahanList: ['Cibubur', 'Ciracas', 'Kelapa Dua Wetan', 'Rambutan', 'Susukan'] },
 { nama: 'Duren Sawit', kelurahanList: ['Duren Sawit', 'Klender', 'Malaka Jaya', 'Malaka Sari', 'Pondok Bambu', 'Pondok Kelapa', 'Pondok Kopi'] },
 { nama: 'Jatinegara', kelurahanList: ['Bali Mester', 'Bidara Cina', 'Cipinang Besar Selatan', 'Cipinang Besar Utara', 'Cipinang Cempedak', 'Cipinang Muara', 'Kampung Melayu', 'Rawa Bunga'] },
 { nama: 'Kramat Jati', kelurahanList: ['Bale Kambang', 'Batu Ampar', 'Cawang', 'Cililitan', 'Dukuh', 'Kramat Jati', 'Tengah'] },
 { nama: 'Makasar', kelurahanList: ['Cipinang Melayu', 'Halim Perdanakusuma', 'Kebon Pala', 'Makasar', 'Pinang Ranti'] },
 { nama: 'Matraman', kelurahanList: ['Kayu Manis', 'Kebon Manggis', 'Palmeriam', 'Pisangan Baru', 'Utan Kayu Selatan', 'Utan Kayu Utara'] },
 { nama: 'Pasar Rebo', kelurahanList: ['Baru', 'Cijantung', 'Gedong', 'Kalisari', 'Pekayon'] },
 { nama: 'Pulo Gadung', kelurahanList: ['Cipinang', 'Jati', 'Jatinegara', 'Kayu Putih', 'Pisangan Timur', 'Pulo Gadung', 'Rawamangun'] }
 ]},
 { nama: 'Jakarta Barat', kecamatanList: [
 { nama: 'Cengkareng', kelurahanList: ['Cengkareng Barat', 'Cengkareng Timur', 'Duri Kosambi', 'Kapuk', 'Kedaung Kali Angke', 'Rawa Buaya'] },
 { nama: 'Grogol Petamburan', kelurahanList: ['Grogol', 'Jelambar', 'Jelambar Baru', 'Tanjung Duren Selatan', 'Tanjung Duren Utara', 'Tomang', 'Wijaya Kusuma'] },
 { nama: 'Kalideres', kelurahanList: ['Kalideres', 'Kamal', 'Pegadungan', 'Semanan', 'Tegal Alur'] },
 { nama: 'Kebon Jeruk', kelurahanList: ['Duri Kepa', 'Kedoya Selatan', 'Kedoya Utara', 'Kebon Jeruk', 'Kelapa Dua', 'Sukabumi Selatan', 'Sukabumi Utara'] },
 { nama: 'Kembangan', kelurahanList: ['Joglo', 'Kembangan Selatan', 'Kembangan Utara', 'Meruya Selatan', 'Meruya Utara', 'Srengseng'] },
 { nama: 'Palmerah', kelurahanList: ['Jati Pulo', 'Kemanggisan', 'Kota Bambu Selatan', 'Kota Bambu Utara', 'Palmerah', 'Slipi'] },
 { nama: 'Taman Sari', kelurahanList: ['Glodok', 'Keagungan', 'Krukut', 'Mangga Besar', 'Maphar', 'Pinangsia', 'Taman Sari', 'Tangki'] },
 { nama: 'Tambora', kelurahanList: ['Angke', 'Duri Selatan', 'Duri Utara', 'Jembatan Besi', 'Jembatan Lima', 'Kalianyar', 'Krendang', 'Pekojan', 'Roa Malaka', 'Tambora', 'Tanah Sereal'] }
 ]},
 { nama: 'Jakarta Pusat', kecamatanList: [
 { nama: 'Cempaka Putih', kelurahanList: ['Cempaka Putih Barat', 'Cempaka Putih Timur', 'Rawasari'] },
 { nama: 'Gambir', kelurahanList: ['Cideng', 'Duri Pulo', 'Gambir', 'Kebon Kelapa', 'Petojo Selatan', 'Petojo Utara'] },
 { nama: 'Johar Baru', kelurahanList: ['Galur', 'Johar Baru', 'Kampung Rawa', 'Tanah Tinggi'] },
 { nama: 'Kemayoran', kelurahanList: ['Cempaka Baru', 'Gunung Sahari Selatan', 'Harapan Mulia', 'Kebon Kosong', 'Kemayoran', 'Serdang', 'Sumur Batu', 'Utan Panjang'] },
 { nama: 'Menteng', kelurahanList: ['Cikini', 'Gondangdia', 'Kebon Sirih', 'Menteng', 'Pegangsaan'] },
 { nama: 'Sawah Besar', kelurahanList: ['Gunung Sahari Utara', 'Karang Anyar', 'Kartini', 'Mangga Dua Selatan', 'Pasar Baru'] },
 { nama: 'Senen', kelurahanList: ['Bungur', 'Kwitang', 'Kramat', 'Kenari', 'Paseban', 'Senen'] },
 { nama: 'Tanah Abang', kelurahanList: ['Bendungan Hilir', 'Gelora', 'Kampung Bali', 'Kebon Kacang', 'Kebon Melati', 'Petamburan', 'Tanah Abang'] }
 ]},
 { nama: 'Jakarta Utara', kecamatanList: [
 { nama: 'Cilincing', kelurahanList: ['Cilincing', 'Kalibaru', 'Marunda', 'Rorotan', 'Semper Barat', 'Semper Timur', 'Sukapura'] },
 { nama: 'Kelapa Gading', kelurahanList: ['Kelapa Gading Barat', 'Kelapa Gading Timur', 'Pegangsaan Dua'] },
 { nama: 'Koja', kelurahanList: ['Koja', 'Lagoa', 'Rawa Badak Selatan', 'Rawa Badak Utara', 'Tugu Selatan', 'Tugu Utara'] },
 { nama: 'Pademangan', kelurahanList: ['Ancol', 'Pademangan Barat', 'Pademangan Timur'] },
 { nama: 'Penjaringan', kelurahanList: ['Kamal Muara', 'Kapuk Muara', 'Pejagalan', 'Penjaringan', 'Pluit'] },
 { nama: 'Tanjung Priok', kelurahanList: ['Kebon Bawang', 'Papanggo', 'Sungai Bambu', 'Sunter Agung', 'Sunter Jaya', 'Tanjung Priok', 'Warakas'] }
 ]},
 { nama: 'Kepulauan Seribu', kecamatanList: [
 { nama: 'Kepulauan Seribu Selatan', kelurahanList: ['Pulau Kelapa', 'Pulau Pari', 'Pulau Tidung', 'Pulau Untung Jawa'] },
 { nama: 'Kepulauan Seribu Utara', kelurahanList: ['Pulau Harapan', 'Pulau Panggang'] }
 ]}
 ]
 },
 {
 provinsi: 'Jawa Barat',
 kotaList: [
 { nama: 'Kota Bandung', kecamatanList: [
 { nama: 'Andir', kelurahanList: ['Campaka', 'Ciroyom', 'Dungus Cariang', 'Garuda', 'Kebon Jeruk', 'Maleber'] },
 { nama: 'Astana Anyar', kelurahanList: ['Cibadak', 'Karang Anyar', 'Karasak', 'Nyengseret', 'Panjunan', 'Pelindung Hewan'] },
 { nama: 'Babakan Ciparay', kelurahanList: ['Babakan', 'Babakan Ciparay', 'Cirangrang', 'Margahayu Utara', 'Margasuka', 'Sukahaji'] },
 { nama: 'Bandung Kidul', kelurahanList: ['Batununggal', 'Mengger', 'Wates'] },
 { nama: 'Bandung Kulon', kelurahanList: ['Caringin', 'Cigondewah Hilir', 'Cigondewah Kaler', 'Cigondewah Rahayu', 'Cibuntu', 'Gempolsari', 'Warung Muncang'] },
 { nama: 'Bandung Wetan', kelurahanList: ['Cihapit', 'Citarum', 'Tamansari'] },
 { nama: 'Batununggal', kelurahanList: ['Binong', 'Cibangkong', 'Gumuruh', 'Kacapiring', 'Kebonwaru', 'Maleer', 'Samoja'] },
 { nama: 'Bojongloa Kaler', kelurahanList: ['Babakan Asih', 'Babakan Tarogong', 'Jamika', 'Kopo', 'Suka Asih'] },
 { nama: 'Coblong', kelurahanList: ['Cipaganti', 'Dago', 'Lebak Gede', 'Lebak Siliwangi', 'Sadang Serang', 'Sekeloa'] },
 { nama: 'Cicendo', kelurahanList: ['Arjuna', 'Husen Sastranegara', 'Pajajaran', 'Pamoyanan', 'Pasirkaliki', 'Sukaraja'] },
 { nama: 'Kiaracondong', kelurahanList: ['Babakan Surabaya', 'Cicaheum', 'Kebon Jayanti', 'Kebon Kangkung', 'Sukapura'] },
 { nama: 'Lengkong', kelurahanList: ['Burangrang', 'Cikawao', 'Cijagra', 'Lingkar Selatan', 'Malabar', 'Paledang', 'Turangga'] },
 { nama: 'Sumur Bandung', kelurahanList: ['Babakan Ciamis', 'Braga', 'Kebon Pisang', 'Merdeka'] }
 ]},
 { nama: 'Kota Bekasi', kecamatanList: [
 { nama: 'Bantar Gebang', kelurahanList: ['Bantar Gebang', 'Ciketing Udik', 'Cikiwul', 'Sumur Batu'] },
 { nama: 'Bekasi Barat', kelurahanList: ['Bintara', 'Bintara Jaya', 'Jakasampurna', 'Kota Baru', 'Kranji'] },
 { nama: 'Bekasi Selatan', kelurahanList: ['Jaka Mulya', 'Jaka Setia', 'Kayuringin Jaya', 'Marga Jaya', 'Pekayon Jaya'] },
 { nama: 'Bekasi Timur', kelurahanList: ['Aren Jaya', 'Bekasi Jaya', 'Duren Jaya', 'Margahayu'] },
 { nama: 'Bekasi Utara', kelurahanList: ['Harapan Baru', 'Harapan Jaya', 'Kaliabang Tengah', 'Marga Mulya', 'Perwira', 'Teluk Pucung'] },
 { nama: 'Jatiasih', kelurahanList: ['Jati Asih', 'Jati Kramat', 'Jati Luhur', 'Jati Mekar', 'Jati Sari', 'Jati Warna'] },
 { nama: 'Jatisampurna', kelurahanList: ['Jati Karya', 'Jati Rangga', 'Jati Ranggon', 'Jati Sampurna'] },
 { nama: 'Medan Satria', kelurahanList: ['Harapan Mulya', 'Kali Baru', 'Medan Satria', 'Pejuang'] },
 { nama: 'Mustika Jaya', kelurahanList: ['Cimuning', 'Mustika Jaya', 'Mustika Sari', 'Padurenan'] },
 { nama: 'Pondok Gede', kelurahanList: ['Jati Bening', 'Jati Bening Baru', 'Jati Cempaka', 'Jati Makmur', 'Jati Waringin'] },
 { nama: 'Pondok Melati', kelurahanList: ['Jati Melati', 'Jati Murni', 'Jati Rahayu', 'Jati Warna'] },
 { nama: 'Rawalumbu', kelurahanList: ['Bojong Menteng', 'Bojong Rawalumbu', 'Pengasinan', 'Sepanjang Jaya'] }
 ]},
 { nama: 'Kota Depok', kecamatanList: [
 { nama: 'Beji', kelurahanList: ['Beji', 'Beji Timur', 'Kemiri Muka', 'Kukusan', 'Pondok Cina', 'Tanah Baru'] },
 { nama: 'Bojongsari', kelurahanList: ['Bojongsari', 'Bojongsari Baru', 'Curug', 'Duren Mekar', 'Duren Seribu', 'Pondok Petir', 'Serua'] },
 { nama: 'Cilodong', kelurahanList: ['Cilodong', 'Jatimulya', 'Kalibaru', 'Kalimulya', 'Sukamaju'] },
 { nama: 'Cimanggis', kelurahanList: ['Cisalak Pasar', 'Curug', 'Harjamukti', 'Mekarsari', 'Pasir Gunung Selatan', 'Tugu'] },
 { nama: 'Cinere', kelurahanList: ['Cinere', 'Gandul', 'Pangkalan Jati', 'Pangkalan Jati Baru'] },
 { nama: 'Cipayung', kelurahanList: ['Bojong Pondok Terong', 'Cipayung', 'Cipayung Jaya', 'Pondok Jaya', 'Ratujaya'] },
 { nama: 'Limo', kelurahanList: ['Grogol', 'Krukut', 'Limo', 'Meruyung'] },
 { nama: 'Pancoran Mas', kelurahanList: ['Depok', 'Depok Jaya', 'Mampang', 'Pancoran Mas', 'Rangkapan Jaya', 'Rangkapan Jaya Baru'] },
 { nama: 'Sawangan', kelurahanList: ['Bedahan', 'Cinangka', 'Pengasinan', 'Sawangan', 'Sawangan Baru'] },
 { nama: 'Sukmajaya', kelurahanList: ['Abadijaya', 'Baktijaya', 'Cisalak', 'Mekarjaya', 'Sukmajaya', 'Tirtajaya'] },
 { nama: 'Tapos', kelurahanList: ['Cilangkap', 'Cimpaeun', 'Jatijajar', 'Leuwinanggung', 'Sukamaju Baru', 'Sukatani', 'Tapos'] }
 ]},
 { nama: 'Kota Bogor', kecamatanList: [
 { nama: 'Bogor Barat', kelurahanList: ['Balumbang Jaya', 'Bubulak', 'Cilendek Barat', 'Cilendek Timur', 'Curug', 'Curug Mekar', 'Loji', 'Margajaya', 'Menteng', 'Pasir Jaya', 'Pasir Kuda', 'Pasir Mulya', 'Semplak', 'Sinda Barang', 'Situgede'] },
 { nama: 'Bogor Selatan', kelurahanList: ['Batutulis', 'Bondongan', 'Cikaret', 'Empang', 'Genteng', 'Harjasari', 'Muarasari', 'Mulyaharja', 'Pakuan', 'Pamoyanan', 'Rancamaya', 'Ranggamekar'] },
 { nama: 'Bogor Tengah', kelurahanList: ['Babakan', 'Babakan Pasar', 'Cibogor', 'Ciwaringin', 'Gudang', 'Kebon Kelapa', 'Pabaton', 'Paledang', 'Panaragan', 'Sempur', 'Tegal Lega'] },
 { nama: 'Bogor Timur', kelurahanList: ['Baranangsiang', 'Katulampa', 'Sukasari', 'Tajur'] },
 { nama: 'Bogor Utara', kelurahanList: ['Bantarjati', 'Cibuluh', 'Ciluar', 'Cimahpar', 'Ciparigi', 'Kedung Halang', 'Tegal Gundil', 'Tanah Baru'] },
 { nama: 'Tanah Sareal', kelurahanList: ['Cibadak', 'Kayu Manis', 'Kebon Pedes', 'Kedung Badak', 'Kedung Jaya', 'Kedung Waringin', 'Kencana', 'Mekarwangi', 'Sukaresmi', 'Sukadamai', 'Tanah Sareal'] }
 ]},
 { nama: 'Kota Cimahi', kecamatanList: [
 { nama: 'Cimahi Selatan', kelurahanList: ['Cibeber', 'Cibeureum', 'Leuwigajah', 'Melong', 'Utama'] },
 { nama: 'Cimahi Tengah', kelurahanList: ['Baros', 'Cigugur Tengah', 'Cimahi', 'Karangmekar', 'Padasuka', 'Setiamanah'] },
 { nama: 'Cimahi Utara', kelurahanList: ['Cibabat', 'Cipageran', 'Citeureup'] }
 ]},
 { nama: 'Kota Cirebon', kecamatanList: [
 { nama: 'Harjamukti', kelurahanList: ['Argasunya', 'Harjamukti', 'Kalijaga', 'Kecapi', 'Larangan'] },
 { nama: 'Kejaksan', kelurahanList: ['Kebon Baru', 'Kejaksaan', 'Kesenden', 'Sukapura'] },
 { nama: 'Kesambi', kelurahanList: ['Drajat', 'Karyamulya', 'Kesambi', 'Pekiringan', 'Sunyaragi'] },
 { nama: 'Lemahwungkuk', kelurahanList: ['Kesepuhan', 'Lemahwungkuk', 'Panjunan', 'Pegambiran'] },
 { nama: 'Pekalipan', kelurahanList: ['Jagasatru', 'Pekalangan', 'Pekalipan', 'Pulasaren'] }
 ]},
 { nama: 'Kota Sukabumi', kecamatanList: [
 { nama: 'Baros', kelurahanList: ['Baros', 'Jayamekar', 'Jayaraksa'] },
 { nama: 'Cibeureum', kelurahanList: ['Babakan', 'Cibeureum Hilir', 'Limusnunggal', 'Sindangpalay'] },
 { nama: 'Cikole', kelurahanList: ['Cikole', 'Gunung Parang', 'Kebonjati', 'Selabatu'] },
 { nama: 'Citamiang', kelurahanList: ['Citamiang', 'Gedongpanjang', 'Nanggeleng', 'Tipar'] },
 { nama: 'Gunungpuruh', kelurahanList: ['Gunungparang', 'Gunungpuruh', 'Karamat'] },
 { nama: 'Lembursitu', kelurahanList: ['Lembursitu', 'Situmekar'] },
 { nama: 'Warudoyong', kelurahanList: ['Benteng', 'Dayeuhluhur', 'Nyomplong', 'Warudoyong'] }
 ]},
 { nama: 'Kota Tasikmalaya', kecamatanList: [
 { nama: 'Bungursari', kelurahanList: ['Bungursari', 'Sukajaya', 'Sukarindik'] },
 { nama: 'Cibeureum', kelurahanList: ['Awipari', 'Ciakar', 'Ciherang', 'Margabakti', 'Setianagara'] },
 { nama: 'Cihideung', kelurahanList: ['Argasari', 'Cilembang', 'Nagarasari', 'Yudanagara'] },
 { nama: 'Cipedes', kelurahanList: ['Cipedes', 'Nagarawangi', 'Panglayungan', 'Sukamanah'] },
 { nama: 'Indihiang', kelurahanList: ['Indihiang', 'Parakannyasag', 'Sukajaya'] },
 { nama: 'Kawalu', kelurahanList: ['Cibeuti', 'Gunung Tandala', 'Leuwiliang', 'Tawang'] },
 { nama: 'Mangkubumi', kelurahanList: ['Cigantang', 'Karikil', 'Linggajaya', 'Mangkubumi'] },
 { nama: 'Purbaratu', kelurahanList: ['Purbaratu', 'Singkup', 'Sukajaya', 'Sukanagara'] },
 { nama: 'Tawang', kelurahanList: ['Cikalang', 'Empangsari', 'Kahuripan', 'Lengkongsari', 'Tawang'] }
 ]},
 { nama: 'Kota Banjar', kecamatanList: [
 { nama: 'Banjar', kelurahanList: ['Banjar', 'Hegarsari', 'Mekarsari'] },
 { nama: 'Langensari', kelurahanList: ['Kujangsari', 'Langensari', 'Rejasari', 'Waringinsari'] },
 { nama: 'Pataruman', kelurahanList: ['Batulawang', 'Karyamukti', 'Pataruman', 'Sinartanjung'] },
 { nama: 'Purwaharja', kelurahanList: ['Purwaharja', 'Raharja'] }
 ]},
 { nama: 'Kab. Bandung', kecamatanList: [
 { nama: 'Baleendah', kelurahanList: ['Andir', 'Baleendah', 'Jelekong', 'Malakasari', 'Manggahang', 'Rancamanyar'] },
 { nama: 'Banjaran', kelurahanList: ['Banjaran', 'Kamasan', 'Mekarjaya', 'Pameuntasan', 'Tarajusari'] },
 { nama: 'Cicalengka', kelurahanList: ['Babakan Peuteuy', 'Cicalengka Kulon', 'Cicalengka Wetan', 'Narawita', 'Tenjolaya'] },
 { nama: 'Cileunyi', kelurahanList: ['Cibiru Hilir', 'Cibiru Wetan', 'Cilengkrang', 'Cileunyi Kulon', 'Cileunyi Wetan', 'Cimekar'] },
 { nama: 'Dayeuhkolot', kelurahanList: ['Cangkuang Kulon', 'Cangkuang Wetan', 'Citereup', 'Dayeuhkolot', 'Sukapura'] },
 { nama: 'Katapang', kelurahanList: ['Cilampeni', 'Gandasari', 'Katapang', 'Pangauban', 'Sukamukti'] },
 { nama: 'Margahayu', kelurahanList: ['Margahayu Selatan', 'Margahayu Tengah', 'Sayati', 'Sukamenak'] },
 { nama: 'Pangalengan', kelurahanList: ['Banjarsari', 'Margamukti', 'Pangalengan', 'Sukaluyu', 'Warnasari'] },
 { nama: 'Rancaekek', kelurahanList: ['Bojongloa', 'Jelegong', 'Linggar', 'Nanjung Mekar', 'Rancaekek Kulon', 'Rancaekek Wetan', 'Sukamanah'] },
 { nama: 'Soreang', kelurahanList: ['Cingcin', 'Karamatmulya', 'Panyirapan', 'Parigi', 'Soreang', 'Sukajadi'] }
 ]},
 { nama: 'Kab. Bandung Barat', kecamatanList: [
 { nama: 'Batujajar', kelurahanList: ['Batujajar Barat', 'Batujajar Timur', 'Galanggang', 'Selacau'] },
 { nama: 'Cikalongwetan', kelurahanList: ['Cikalongwetan', 'Cisomang', 'Mandalasari', 'Mekarjaya'] },
 { nama: 'Cihampelas', kelurahanList: ['Cihampelas', 'Cipatik', 'Mekar Mukti', 'Tanjung Wangi'] },
 { nama: 'Cililin', kelurahanList: ['Batulayang', 'Budiharja', 'Cililin', 'Karangtanjung', 'Mukapayung'] },
 { nama: 'Cipatat', kelurahanList: ['Cipatat', 'Citatah', 'Rajamandala Kulon', 'Sumurbandung'] },
 { nama: 'Cisarua', kelurahanList: ['Cisarua', 'Jambudipa', 'Kertawangi', 'Pasirhalang', 'Pasirlangu'] },
 { nama: 'Lembang', kelurahanList: ['Cibodas', 'Cikahuripan', 'Jayagiri', 'Langensari', 'Lembang', 'Mekarwangi', 'Pagerwangi', 'Sukajaya', 'Suntenjaya', 'Wangunharja'] },
 { nama: 'Ngamprah', kelurahanList: ['Cilame', 'Cimareme', 'Gadobangkong', 'Mekarsari', 'Ngamprah', 'Pakuhaji', 'Tanimulya'] },
 { nama: 'Padalarang', kelurahanList: ['Cimerang', 'Ciburuy', 'Jayamekar', 'Kertajaya', 'Laksanamekar', 'Padalarang', 'Tagogapu'] },
 { nama: 'Parongpong', kelurahanList: ['Cihanjuang', 'Cihideung', 'Cigugur Girang', 'Karyawangi', 'Sariwangi'] }
 ]},
 { nama: 'Kab. Bekasi', kecamatanList: [
 { nama: 'Cikarang Barat', kelurahanList: ['Danau Indah', 'Ganda Mekar', 'Jatireja', 'Kalijeruk', 'Telaga Murni', 'Telajung'] },
 { nama: 'Cikarang Pusat', kelurahanList: ['Hegarmukti', 'Jayamukti', 'Pasir Gombong', 'Sukamahi'] },
 { nama: 'Cikarang Selatan', kelurahanList: ['Ciantra', 'Cikarang', 'Serang', 'Sukadami', 'Sukaresmi'] },
 { nama: 'Cikarang Timur', kelurahanList: ['Cipayung', 'Hegarmanah', 'Jaya Sampurna', 'Sertajaya'] },
 { nama: 'Cikarang Utara', kelurahanList: ['Harja Mekar', 'Karangbaru', 'Pasirgombong', 'Waluya', 'Wanasari'] },
 { nama: 'Tambun Selatan', kelurahanList: ['Jatimulya', 'Lambangjaya', 'Mekarsari', 'Setiadarma', 'Sumberjaya', 'Tambun'] }
 ]},
 { nama: 'Kab. Bogor', kecamatanList: [
 { nama: 'Cibinong', kelurahanList: ['Cibinong', 'Cirimekar', 'Karadenan', 'Nanggewer', 'Nanggewer Mekar', 'Pakansari', 'Pondok Rajeg', 'Sukahati', 'Tengah'] },
 { nama: 'Cileungsi', kelurahanList: ['Cileungsi', 'Cileungsi Kidul', 'Gandoang', 'Jatisari', 'Limusnunggal', 'Mekarsari', 'Setu Sari'] },
 { nama: 'Gunung Putri', kelurahanList: ['Bojong Kulur', 'Cicadas', 'Cikeas Udik', 'Gunung Putri', 'Nagrak', 'Tlajung Udik', 'Wanaherang'] },
 { nama: 'Parung', kelurahanList: ['Bojongsempu', 'Cogreg', 'Iwul', 'Jabon Mekar', 'Pamegarsari', 'Parung', 'Waru', 'Warujaya'] }
 ]},
 { nama: 'Kab. Cianjur', kecamatanList: [
 { nama: 'Cianjur', kelurahanList: ['Bojongherang', 'Nagrak', 'Pamoyanan', 'Sabandar', 'Sawah Gede', 'Solokpandan'] },
 { nama: 'Cipanas', kelurahanList: ['Batulawang', 'Cipanas', 'Palasari', 'Sindangjaya', 'Sindanglaya'] },
 { nama: 'Pacet', kelurahanList: ['Ciherang', 'Cipendawa', 'Sukatani'] }
 ]},
 { nama: 'Kab. Garut', kecamatanList: [
 { nama: 'Garut Kota', kelurahanList: ['Ciwalen', 'Jayaraga', 'Kota Kulon', 'Kota Wetan', 'Muara Sanding', 'Regol', 'Sukamentri'] },
 { nama: 'Tarogong Kaler', kelurahanList: ['Jayawaras', 'Mekarjaya', 'Pasawahan', 'Rancabango', 'Sukajaya', 'Sukakarya'] },
 { nama: 'Tarogong Kidul', kelurahanList: ['Haurpanggung', 'Kersamenak', 'Pataruman', 'Sukagalih', 'Tarogong'] }
 ]},
 { nama: 'Kab. Karawang', kecamatanList: [
 { nama: 'Karawang Barat', kelurahanList: ['Karawang Kulon', 'Karawang Wetan', 'Nagasari', 'Tanjungpura'] },
 { nama: 'Karawang Timur', kelurahanList: ['Adiarsa Barat', 'Adiarsa Timur', 'Palumbonsari'] },
 { nama: 'Cikampek', kelurahanList: ['Cikampek Pusaka', 'Cikampek Selatan', 'Dawuan Barat', 'Kamojing'] },
 { nama: 'Telukjambe', kelurahanList: ['Margamulya', 'Pinayungan', 'Sukaluyu', 'Telukjambe'] }
 ]},
 { nama: 'Kab. Subang', kecamatanList: [
 { nama: 'Subang', kelurahanList: ['Dangdeur', 'Karanganyar', 'Pasirkareumbi', 'Soklat', 'Sukamelang'] },
 { nama: 'Pamanukan', kelurahanList: ['Bongas', 'Mulyasari', 'Pamanukan'] }
 ]},
 { nama: 'Kab. Sukabumi', kecamatanList: [
 { nama: 'Cibadak', kelurahanList: ['Batununggal', 'Cibadak', 'Karangtengah', 'Pamuruyan', 'Sekarwangi', 'Tenjolaya'] },
 { nama: 'Palabuhanratu', kelurahanList: ['Citepus', 'Jayanti', 'Palabuhanratu'] }
 ]},
 { nama: 'Kab. Sumedang', kecamatanList: [
 { nama: 'Jatinangor', kelurahanList: ['Cibeusi', 'Cilayung', 'Cipacing', 'Cikeruh', 'Hegarmanah', 'Mekargalih', 'Sayang'] },
 { nama: 'Sumedang Selatan', kelurahanList: ['Cipameungpeuk', 'Gunasari', 'Regol Wetan'] },
 { nama: 'Sumedang Utara', kelurahanList: ['Cipancar', 'Jatihurip', 'Kotakaler', 'Situ'] }
 ]}
 ]
 },
 {
 provinsi: 'Riau',
 kotaList: [
 { nama: 'Kota Pekanbaru', kecamatanList: [
 { nama: 'Bukit Raya', kelurahanList: ['Dirgantara', 'Simpang Tiga', 'Tangkerang Labuai', 'Tangkerang Selatan', 'Tangkerang Utara'] },
 { nama: 'Marpoyan Damai', kelurahanList: ['Maharatu', 'Sidomulyo Timur', 'Tangkerang Barat', 'Tangkerang Tengah', 'Wonorejo'] },
 { nama: 'Pekanbaru Kota', kelurahanList: ['Kota Baru', 'Kota Tinggi', 'Sago', 'Simpang Empat', 'Sukaramai', 'Tanah Datar'] },
 { nama: 'Sukajadi', kelurahanList: ['Harjosari', 'Jadirejo', 'Kampung Melayu', 'Kampung Tengah', 'Kedungasri', 'Pulau Karam', 'Sukajadi'] },
 { nama: 'Senapelan', kelurahanList: ['Kampung Bandar', 'Kampung Baru', 'Padang Bulan', 'Padang Terubuk', 'Sago', 'Sri Meranti'] },
 { nama: 'Payung Sekaki', kelurahanList: ['Air Hitam', 'Labuh Baru Barat', 'Labuh Baru Timur', 'Sungai Sibam', 'Tampan'] },
 { nama: 'Rumbai', kelurahanList: ['Meranti Pandak', 'Muara Fajar', 'Palas', 'Rumbai Bukit', 'Sri Meranti', 'Umban Sari'] }
 ]},
 { nama: 'Kota Dumai', kecamatanList: [
 { nama: 'Dumai Barat', kelurahanList: ['Bukit Datuk', 'Pangkalan Sesai', 'Simpang Tetap Darul Ihsan'] },
 { nama: 'Dumai Kota', kelurahanList: ['Bintan', 'Dumai Kota', 'Laksamana', 'Rimba Sekampung', 'Sukajadi'] },
 { nama: 'Dumai Selatan', kelurahanList: ['Bukit Kayu Kapur', 'Mekar Sari', 'Ratu Sima'] },
 { nama: 'Dumai Timur', kelurahanList: ['Bukit Batrem', 'Jayamukti', 'Teluk Binjai', 'Tanjung Palas'] }
 ]},
 { nama: 'Kab. Kampar', kecamatanList: [
 { nama: 'Bangkinang', kelurahanList: ['Bangkinang', 'Kumantan', 'Muara Uwai'] },
 { nama: 'Bangkinang Kota', kelurahanList: ['Bangkinang Kota', 'Langgini', 'Ridan Permai'] },
 { nama: 'Kampar', kelurahanList: ['Air Tiris', 'Kampar'] },
 { nama: 'Siak Hulu', kelurahanList: ['Pandau Jaya', 'Tanah Merah', 'Tanjung Medang'] },
 { nama: 'Tapung', kelurahanList: ['Petapahan', 'Sari Galuh', 'Tapung'] }
 ]},
 { nama: 'Kab. Bengkalis', kecamatanList: [
 { nama: 'Bengkalis', kelurahanList: ['Bengkalis Kota', 'Damon', 'Rimba Sekampung'] },
 { nama: 'Mandau', kelurahanList: ['Air Jamban', 'Balik Alam', 'Duri Barat', 'Duri Timur', 'Talang Mandi'] }
 ]},
 { nama: 'Kab. Indragiri Hulu', kecamatanList: [
 { nama: 'Rengat', kelurahanList: ['Kampung Besar Kota', 'Kampung Pulau', 'Seberang Cenaku'] },
 { nama: 'Pasir Penyu', kelurahanList: ['Air Molek', 'Pasir Penyu'] }
 ]},
 { nama: 'Kab. Indragiri Hilir', kecamatanList: [
 { nama: 'Tembilahan', kelurahanList: ['Pekan Arba', 'Tembilahan Hilir', 'Tembilahan Hulu'] },
 { nama: 'Tembilahan Hulu', kelurahanList: ['Pulau Palas', 'Sungai Beringin'] }
 ]},
 { nama: 'Kab. Pelalawan', kecamatanList: [
 { nama: 'Pangkalan Kerinci', kelurahanList: ['Pangkalan Kerinci', 'Pangkalan Kerinci Barat', 'Pangkalan Kerinci Kota'] }
 ]},
 { nama: 'Kab. Siak', kecamatanList: [
 { nama: 'Siak', kelurahanList: ['Kampung Dalam', 'Kampung Rempak'] },
 { nama: 'Tualang', kelurahanList: ['Perawang', 'Tualang'] }
 ]}
 ]
 },
 {
 provinsi: 'Sumatera Utara',
 kotaList: [
 { nama: 'Kota Medan', kecamatanList: [
 { nama: 'Medan Kota', kelurahanList: ['Kesawan', 'Mesjid', 'Pandau Hilir', 'Pasar Baru', 'Pusat Pasar', 'Sei Rengas Permata', 'Sudirejo I', 'Sudirejo II', 'Sukaramai I', 'Sukaramai II'] },
 { nama: 'Medan Barat', kelurahanList: ['Glugur Kota', 'Karang Berombak', 'Kesawan', 'Pulo Brayan Kota', 'Sei Agul', 'Silalas'] },
 { nama: 'Medan Timur', kelurahanList: ['Durian', 'Gang Buntu', 'Glugur Darat I', 'Glugur Darat II', 'Perintis', 'Pulo Brayan Bengkel', 'Pulo Brayan Bengkel Baru', 'Sidodadi'] },
 { nama: 'Medan Helvetia', kelurahanList: ['Cinta Damai', 'Dwi Kora', 'Helvetia', 'Helvetia Tengah', 'Helvetia Timur', 'Sei Sikambing C II', 'Tanjung Gusta'] },
 { nama: 'Medan Johor', kelurahanList: ['Gedung Johor', 'Kedai Durian', 'Kwala Bekala', 'Pangkalan Masyhur', 'Sukamaju', 'Titi Kuning'] },
 { nama: 'Medan Selayang', kelurahanList: ['Asam Kumbang', 'Beringin', 'Padang Bulan Selayang I', 'Padang Bulan Selayang II', 'Sempakata', 'Tanjung Sari'] },
 { nama: 'Medan Petisah', kelurahanList: ['Dar Es Salam', 'Petisah Hulu', 'Petisah Tengah', 'Sei Putih Barat', 'Sei Putih Tengah', 'Sei Putih Timur I', 'Sei Putih Timur II', 'Sekip'] }
 ]},
 { nama: 'Kota Binjai', kecamatanList: [
 { nama: 'Binjai Kota', kelurahanList: ['Berngam', 'Kartini', 'Pekan Binjai', 'Satria', 'Tangsi', 'Setia'] },
 { nama: 'Binjai Barat', kelurahanList: ['Bandar Senembah', 'Limau Mungkur', 'Payaroba', 'Suka Maju', 'Suka Ramai'] },
 { nama: 'Binjai Selatan', kelurahanList: ['Bhakti Karya', 'Binjai Estate', 'Rambung Barat', 'Rambung Timur', 'Tanah Tinggi'] },
 { nama: 'Binjai Timur', kelurahanList: ['Dataran Tinggi', 'Mencirim', 'Sumber Karya', 'Sumber Mulyorejo', 'Tanah Merah', 'Timbang Langkat'] },
 { nama: 'Binjai Utara', kelurahanList: ['Cengkeh Turi', 'Damai', 'Jati Karya', 'Jati Makmur', 'Kebun Lada', 'Nangka'] }
 ]},
 { nama: 'Kota Pematang Siantar', kecamatanList: [
 { nama: 'Siantar Barat', kelurahanList: ['Banjar', 'Dwikora', 'Proklamasi', 'Simarito', 'Sipinggol-pinggol', 'Teladan'] },
 { nama: 'Siantar Timur', kelurahanList: ['Asuhan', 'Kebun Sayur', 'Merdeka', 'Pahlawan', 'Pardomuan', 'Siopat Suhu', 'Sukadame', 'Toba'] }
 ]},
 { nama: 'Kab. Deli Serdang', kecamatanList: [
 { nama: 'Lubuk Pakam', kelurahanList: ['Lubuk Pakam I-II', 'Lubuk Pakam III', 'Lubuk Pakam Pekan', 'Pagar Jati', 'Tanjung Garbus'] },
 { nama: 'Percut Sei Tuan', kelurahanList: ['Amplas', 'Bandar Khalifah', 'Bandar Setia', 'Kenangan', 'Laut Dendang', 'Medan Estate', 'Saentis', 'Sampali', 'Sei Rotan', 'Tembung'] },
 { nama: 'Sunggal', kelurahanList: ['Sei Mencirim', 'Sunggal Kanan', 'Tanjung Gusta'] },
 { nama: 'Tanjung Morawa', kelurahanList: ['Bangun Sari', 'Limau Manis', 'Naga Timbul', 'Tanjung Morawa Pekan'] }
 ]},
 { nama: 'Kab. Karo', kecamatanList: [
 { nama: 'Berastagi', kelurahanList: ['Gundaling I', 'Gundaling II', 'Peceren', 'Raya', 'Rumah Berastagi', 'Sempa Jaya'] },
 { nama: 'Kabanjahe', kelurahanList: ['Gung Negeri', 'Kampung Dalam', 'Kota Kabanjahe', 'Lau Cimba', 'Padang Mas', 'Sumber Mufakat'] }
 ]},
 { nama: 'Kab. Toba', kecamatanList: [
 { nama: 'Balige', kelurahanList: ['Balige I', 'Balige II', 'Balige III', 'Huta Namora', 'Lumban Silintong', 'Pasar Balige', 'Tambunan'] },
 { nama: 'Laguboti', kelurahanList: ['Laguboti', 'Ompu Raja'] },
 { nama: 'Porsea', kelurahanList: ['Nainggolan', 'Porsea', 'Sibadihon'] }
 ]}
 ]
 },
 {
 provinsi: 'Aceh',
 kotaList: [
 { nama: 'Kota Banda Aceh', kecamatanList: [
 { nama: 'Baiturrahman', kelurahanList: ['Ateuk Deah Tanoh', 'Ateuk Jawo', 'Ateuk Munjeng', 'Ateuk Pahlawan', 'Neusu Aceh', 'Neusu Jaya', 'Peuniti', 'Seutui', 'Sukaramai'] },
 { nama: 'Kuta Alam', kelurahanList: ['Bandar Baru', 'Beurawe', 'Kota Baru', 'Kuta Alam', 'Lam Din', 'Lam Dullah', 'Mulia', 'Peunayong'] },
 { nama: 'Syiah Kuala', kelurahanList: ['Alue Naga', 'Kopelma Darussalam', 'Lamgugob', 'Peurada', 'Rukoh', 'Tibang'] },
 { nama: 'Ulee Kareng', kelurahanList: ['Ceurih', 'Ie Masen Kayee Adang', 'Lamglumpang', 'Ulee Kareng'] }
 ]},
 { nama: 'Kota Lhokseumawe', kecamatanList: [
 { nama: 'Banda Sakti', kelurahanList: ['Hagu Selatan', 'Hagu Teungoh', 'Kampung Jawa Baru', 'Kampung Jawa Lama', 'Kuta Blang', 'Lancang Garam', 'Mon Geudong', 'Simpang Empat', 'Tumpok Teungoh', 'Uteunkot'] },
 { nama: 'Muara Dua', kelurahanList: ['Alue Awe', 'Blang Pulo', 'Cot Girek Kandang', 'Meunasah Blang', 'Meunasah Mesjid', 'Uteun Bayi'] }
 ]},
 { nama: 'Kab. Aceh Besar', kecamatanList: [
 { nama: 'Darul Imarah', kelurahanList: ['Garot', 'Lampeunerut', 'Lambheu', 'Lampeuneurut Gampong'] },
 { nama: 'Ingin Jaya', kelurahanList: ['Dham', 'Jeulingke', 'Lambaro'] }
 ]},
 { nama: 'Kab. Bireuen', kecamatanList: [
 { nama: 'Bireuen', kelurahanList: ['Bireuen Meunasah Blang', 'Bireuen Meunasah Capa', 'Bireuen Meunasah Dayah'] },
 { nama: 'Peusangan', kelurahanList: ['Cot Gapu', 'Geudong', 'Matang'] }
 ]}
 ]
 },
 {
 provinsi: 'Bengkulu',
 kotaList: [
 { nama: 'Kota Bengkulu', kecamatanList: [
 { nama: 'Ratu Agung', kelurahanList: ['Anggut Atas', 'Anggut Bawah', 'Kebun Kenanga', 'Sawah Lebar', 'Tanah Patah'] },
 { nama: 'Ratu Samban', kelurahanList: ['Anggut Dalam', 'Bajak', 'Kebun Beler', 'Malabero', 'Penurunan'] },
 { nama: 'Gading Cempaka', kelurahanList: ['Cempaka Permai', 'Jalan Gedang', 'Lingkar Barat', 'Padang Harapan'] }
 ]}
 ]
 },
 {
 provinsi: 'Kepulauan Riau',
 kotaList: [
 { nama: 'Kota Batam', kecamatanList: [
 { nama: 'Batam Kota', kelurahanList: ['Baloi Permai', 'Belian', 'Sungai Panas', 'Sukajadi', 'Teluk Tering'] },
 { nama: 'Batu Ampar', kelurahanList: ['Batu Merah', 'Kampung Seraya', 'Sungai Jodoh', 'Tanjung Sengkuang'] },
 { nama: 'Bengkong', kelurahanList: ['Bengkong Harapan', 'Bengkong Indah', 'Bengkong Laut', 'Sadai', 'Tanjung Buntung'] },
 { nama: 'Lubuk Baja', kelurahanList: ['Baloi Indah', 'Kampung Pelita', 'Lubuk Baja Kota', 'Tanjung Uma'] },
 { nama: 'Nongsa', kelurahanList: ['Batu Besar', 'Kabil', 'Ngenang', 'Nongsa', 'Sambau'] },
 { nama: 'Sagulung', kelurahanList: ['Sagulung Kota', 'Sei Langkai', 'Sei Lekop', 'Sei Pelunggut', 'Tembesi'] },
 { nama: 'Sekupang', kelurahanList: ['Patam Lestari', 'Sungai Harapan', 'Tanjung Pinggir', 'Tanjung Riau'] }
 ]},
 { nama: 'Kota Tanjungpinang', kecamatanList: [
 { nama: 'Tanjungpinang Kota', kelurahanList: ['Kampung Bugis', 'Tanjung Ayun Sakti', 'Tanjungpinang Kota'] },
 { nama: 'Tanjungpinang Timur', kelurahanList: ['Air Raja', 'Batu IX', 'Kampung Bulang', 'Melayu Kota Piring', 'Pinang Kencana'] },
 { nama: 'Bukit Bestari', kelurahanList: ['Dompak', 'Sei Jang', 'Tanjung Unggat'] },
 { nama: 'Tanjungpinang Barat', kelurahanList: ['Bukit Cermin', 'Kampung Baru', 'Kemboja', 'Tanjungpinang Barat'] }
 ]},
 { nama: 'Kab. Bintan', kecamatanList: [
 { nama: 'Bintan Timur', kelurahanList: ['Kijang Kota', 'Numbing', 'Toapaya'] },
 { nama: 'Bintan Utara', kelurahanList: ['Tanjung Uban Selatan', 'Tanjung Uban Utara'] }
 ]},
 { nama: 'Kab. Karimun', kecamatanList: [
 { nama: 'Karimun', kelurahanList: ['Lubuk Semut', 'Meral Kota', 'Tanjung Balai'] },
 { nama: 'Tebing', kelurahanList: ['Tebing', 'Pamak'] }
 ]}
 ]
 },
 {
 provinsi: 'Jambi',
 kotaList: [
 { nama: 'Kota Jambi', kecamatanList: [
 { nama: 'Telanaipura', kelurahanList: ['Legok', 'Pematang Sulur', 'Selamat', 'Simpang IV Sipin', 'Sungai Putri', 'Telanaipura', 'Teluk Kenali'] },
 { nama: 'Jambi Selatan', kelurahanList: ['Pakuan Baru', 'Talang Banjar', 'The Hok'] },
 { nama: 'Jambi Timur', kelurahanList: ['Kasang', 'Kasang Jaya', 'Rajawali', 'Sulanjana', 'Tanjung Pinang'] },
 { nama: 'Kota Baru', kelurahanList: ['Kenali Asam Atas', 'Kenali Asam Bawah', 'Mayang Mangurai', 'Rawasari', 'Simpang III Sipin'] },
 { nama: 'Pasar Jambi', kelurahanList: ['Orang Kayo Hitam', 'Pasar Jambi', 'Sungai Asam'] }
 ]},
 { nama: 'Kab. Muaro Jambi', kecamatanList: [
 { nama: 'Jambi Luar Kota', kelurahanList: ['Mendalo Darat', 'Mendalo Indah', 'Pijoan', 'Pondok Meja'] },
 { nama: 'Mestong', kelurahanList: ['Kota Karang', 'Mestong', 'Sungai Buluh'] }
 ]}
 ]
 },
 {
 provinsi: 'Sumatera Selatan',
 kotaList: [
 { nama: 'Kota Palembang', kecamatanList: [
 { nama: 'Ilir Timur I', kelurahanList: ['18 Ilir', '20 Ilir D I', '20 Ilir D III', 'Kepandean Baru', 'Sei Pangeran'] },
 { nama: 'Ilir Barat I', kelurahanList: ['26 Ilir D I', 'Bukit Baru', 'Bukit Lama', 'Demang Lebar Daun', 'Lorok Pakjo', 'Siring Agung'] },
 { nama: 'Kemuning', kelurahanList: ['Ario Kemuning', 'Pahlawan', 'Pipa Reja', 'Sekip Jaya', 'Talang Aman', 'Talang Bubuk'] },
 { nama: 'Sukarami', kelurahanList: ['Kebun Bunga', 'Sukajaya', 'Sukabangun', 'Sukarami', 'Talang Betutu', 'Talang Jambe'] }
 ]},
 { nama: 'Kota Lubuklinggau', kecamatanList: [
 { nama: 'Lubuklinggau Barat I', kelurahanList: ['Batu Urip', 'Batu Urip Taba', 'Lubuk Tanjung', 'Taba Jemekeh'] },
 { nama: 'Lubuklinggau Timur I', kelurahanList: ['Majapahit', 'Taba Koji', 'Watervang'] }
 ]}
 ]
 },
 {
 provinsi: 'Bangka Belitung',
 kotaList: [
 { nama: 'Kota Pangkalpinang', kecamatanList: [
 { nama: 'Pangkalbalam', kelurahanList: ['Ampui', 'Gabek', 'Lontong Pancur', 'Pasir Garam', 'Raja Kecik'] },
 { nama: 'Rangkui', kelurahanList: ['Bintang', 'Gajah Mada', 'Melintang', 'Parit Lalang'] },
 { nama: 'Taman Sari', kelurahanList: ['Gedung Nasional', 'Opas Indah', 'Pintu Air'] }
 ]},
 { nama: 'Kab. Bangka', kecamatanList: [
 { nama: 'Sungailiat', kelurahanList: ['Kenanga', 'Kudai', 'Sungailiat'] }
 ]}
 ]
 },
 {
 provinsi: 'Lampung',
 kotaList: [
 { nama: 'Kota Bandar Lampung', kecamatanList: [
 { nama: 'Tanjung Karang Pusat', kelurahanList: ['Durian Payung', 'Enggal', 'Gotong Royong', 'Gunung Sari', 'Kelapa Tiga', 'Kota Baru', 'Palapa', 'Pasir Gintung', 'Pelita', 'Tanjung Karang'] },
 { nama: 'Kedaton', kelurahanList: ['Kedaton', 'Labuhan Ratu', 'Sepang Jaya', 'Surabaya', 'Sukamenanti'] },
 { nama: 'Rajabasa', kelurahanList: ['Gedong Meneng', 'Rajabasa', 'Rajabasa Jaya', 'Rajabasa Raya'] },
 { nama: 'Sukarame', kelurahanList: ['Korpri Jaya', 'Korpri Raya', 'Sukarame', 'Sukarame Baru', 'Way Dadi', 'Way Dadi Baru'] },
 { nama: 'Telukbetung Selatan', kelurahanList: ['Gedung Pakuon', 'Pesawahan', 'Sukaraja', 'Talang', 'Teluk Betung'] }
 ]},
 { nama: 'Kota Metro', kecamatanList: [
 { nama: 'Metro Pusat', kelurahanList: ['Hadimulyo Barat', 'Hadimulyo Timur', 'Imopuro', 'Metro', 'Yosomulyo'] },
 { nama: 'Metro Timur', kelurahanList: ['Iringmulyo', 'Tejo Agung', 'Tejo Sari', 'Yosodadi'] }
 ]}
 ]
 },
 {
 provinsi: 'Banten',
 kotaList: [
 { nama: 'Kota Tangerang', kecamatanList: [
 { nama: 'Tangerang', kelurahanList: ['Babakan', 'Buaran Indah', 'Cikokol', 'Kelapa Indah', 'Sukasari', 'Sukarasa', 'Tanah Tinggi'] },
 { nama: 'Cipondoh', kelurahanList: ['Cipondoh', 'Cipondoh Indah', 'Cipondoh Makmur', 'Gondrong', 'Kenanga', 'Ketapang', 'Petir', 'Poris Plawad', 'Poris Plawad Indah', 'Poris Plawad Utara'] },
 { nama: 'Karawaci', kelurahanList: ['Bencongan', 'Bugel', 'Cimone', 'Cimone Jaya', 'Gerendeng', 'Karawaci', 'Karawaci Baru', 'Koang Jaya', 'Margasari', 'Namboo Jaya', 'Nambo Jaya', 'Pabuaran', 'Pabuaran Tumpeng', 'Sukajadi', 'Sumur Pacing'] },
 { nama: 'Ciledug', kelurahanList: ['Paninggilan', 'Paninggilan Utara', 'Parung Serab', 'Sudimara Barat', 'Sudimara Jaya', 'Sudimara Selatan', 'Sudimara Timur', 'Tajur'] }
 ]},
 { nama: 'Kota Tangerang Selatan', kecamatanList: [
 { nama: 'Serpong', kelurahanList: ['Buaran', 'Ciater', 'Cilenggang', 'Lengkong Gudang', 'Lengkong Gudang Timur', 'Lengkong Wetan', 'Rawa Buntu', 'Rawa Mekar Jaya', 'Serpong'] },
 { nama: 'Serpong Utara', kelurahanList: ['Jelupang', 'Lengkong Karya', 'Pakualam', 'Pakulonan', 'Pondok Jagung', 'Pondok Jagung Timur'] },
 { nama: 'Pamulang', kelurahanList: ['Bambu Apus', 'Benda Baru', 'Kedaung', 'Pamulang Barat', 'Pamulang Timur', 'Pondok Benda', 'Pondok Cabe Ilir', 'Pondok Cabe Udik'] },
 { nama: 'Ciputat', kelurahanList: ['Cipayung', 'Ciputat', 'Jombang', 'Sawah', 'Sawah Baru', 'Sawah Lama', 'Serua', 'Serua Indah'] },
 { nama: 'Pondok Aren', kelurahanList: ['Jurang Mangu Barat', 'Jurang Mangu Timur', 'Parigi', 'Parigi Baru', 'Pondok Aren', 'Pondok Jaya', 'Pondok Karya'] },
 { nama: 'Setu', kelurahanList: ['Babakan', 'Bakti Jaya', 'Kademangan', 'Muncul', 'Setu'] }
 ]},
 { nama: 'Kota Serang', kecamatanList: [
 { nama: 'Serang', kelurahanList: ['Cipare', 'Kota Baru', 'Lopang', 'Serang', 'Terondol', 'Unyur'] },
 { nama: 'Cipocok Jaya', kelurahanList: ['Cipocok Jaya', 'Dalung', 'Panancangan', 'Tembong'] }
 ]},
 { nama: 'Kota Cilegon', kecamatanList: [
 { nama: 'Cilegon', kelurahanList: ['Bendungan', 'Ciwedus', 'Jombang Wetan', 'Ketileng', 'Masigit'] },
 { nama: 'Pulomerak', kelurahanList: ['Lebak Gede', 'Mekarsari', 'Suralaya', 'Tamanbaru'] }
 ]}
 ]
 },
 {
 provinsi: 'Jawa Tengah',
 kotaList: [
 { nama: 'Kota Semarang', kecamatanList: [
 { nama: 'Semarang Tengah', kelurahanList: ['Bangunharjo', 'Brumbungan', 'Gabahan', 'Karang Kidul', 'Kranggan', 'Miroto', 'Pekunden', 'Pendrikan Kidul', 'Pendrikan Lor', 'Purwodinatan', 'Sekayu'] },
 { nama: 'Semarang Selatan', kelurahanList: ['Barusari', 'Bulustalan', 'Lamper Kidul', 'Lamper Lor', 'Lamper Tengah', 'Mugassari', 'Peterongan', 'Pleburan', 'Randusari', 'Wonodri'] },
 { nama: 'Semarang Barat', kelurahanList: ['Bojong Salaman', 'Cabean', 'Gisikdrono', 'Kalibanteng Kidul', 'Kalibanteng Kulon', 'Kembangarum', 'Krapyak', 'Krobokan', 'Manyaran', 'Ngemplak Simongan', 'Salamanmloyo', 'Tambakharjo', 'Tawangmas', 'Tawangsari'] },
 { nama: 'Tembalang', kelurahanList: ['Bulusan', 'Jangli', 'Kedungmundu', 'Kramas', 'Mangunharjo', 'Meteseh', 'Rowosari', 'Sambiroto', 'Sendangguwo', 'Sendangmulyo', 'Tandang', 'Tembalang'] },
 { nama: 'Banyumanik', kelurahanList: ['Banyumanik', 'Gedawang', 'Jabungan', 'Ngesrep', 'Padangsari', 'Pedalangan', 'Pudakpayung', 'Srondol Kulon', 'Srondol Wetan', 'Sumurboto', 'Tinjomoyo'] },
 { nama: 'Gajahmungkur', kelurahanList: ['Bendandan', 'Bendan Duwur', 'Bendan Ngisor', 'Gajahmungkur', 'Karangrejo', 'Lempongsari', 'Petompon', 'Sampangan'] }
 ]},
 { nama: 'Kota Surakarta (Solo)', kecamatanList: [
 { nama: 'Banjarsari', kelurahanList: ['Banyuanyar', 'Gilingan', 'Kadipiro', 'Keprabon', 'Kestalan', 'Ketelan', 'Mangkubumen', 'Manahan', 'Nusukan', 'Punggawan', 'Setabelan', 'Sumber', 'Timuran'] },
 { nama: 'Jebres', kelurahanList: ['Gandekan', 'Jagalan', 'Jebres', 'Kepatihan Kulon', 'Kepatihan Wetan', 'Mojosongo', 'Pucang Sawit', 'Purwodiningratan', 'Sewu', 'Sudiroprajan', 'Tegalharjo'] },
 { nama: 'Laweyan', kelurahanList: ['Bumi', 'Jajar', 'Karangasem', 'Kerten', 'Laweyan', 'Pajang', 'Panularan', 'Penumping', 'Purwosari', 'Sondakan', 'Sriwedari'] },
 { nama: 'Pasar Kliwon', kelurahanList: ['Baluwarti', 'Gajahan', 'Joyosuran', 'Kampung Baru', 'Kauman', 'Kedung Lumbu', 'Pasar Kliwon', 'Sangkrah', 'Semanggi'] },
 { nama: 'Serengan', kelurahanList: ['Danukusuman', 'Jayengan', 'Joyontakan', 'Kemlayan', 'Kratonan', 'Serengan', 'Tipes'] }
 ]},
 { nama: 'Kota Magelang', kecamatanList: [
 { nama: 'Magelang Selatan', kelurahanList: ['Jurangombo Selatan', 'Jurangombo Utara', 'Magersari', 'Rejowinangun Selatan', 'Tidar Selatan', 'Tidar Utara'] },
 { nama: 'Magelang Tengah', kelurahanList: ['Cacaban', 'Gelangan', 'Kemirirejo', 'Magelang', 'Panjang', 'Rejowinangun Utara'] },
 { nama: 'Magelang Utara', kelurahanList: ['Kedungsari', 'Kramat Selatan', 'Kramat Utara', 'Potrobangsan', 'Wates'] }
 ]},
 { nama: 'Kab. Banyumas', kecamatanList: [
 { nama: 'Purwokerto Barat', kelurahanList: ['Bantarsoka', 'Kedungwuluh', 'Pasir Kidul', 'Pasir Lor', 'Rejasari'] },
 { nama: 'Purwokerto Selatan', kelurahanList: ['Berkoh', 'Karang Klesem', 'Purwokerto Kidul', 'Purwokerto Kulon', 'Tanjung', 'Teluk'] },
 { nama: 'Purwokerto Timur', kelurahanList: ['Arcawinangun', 'Kranji', 'Mersi', 'Purwokerto Lor', 'Purwokerto Wetan', 'Sokanegara'] },
 { nama: 'Purwokerto Utara', kelurahanList: ['Bancarkembar', 'Bobosan', 'Grendeng', 'Karang Wangkal', 'Pabuaran', 'Purwanegara', 'Sumampir'] }
 ]}
 ]
 },
 {
 provinsi: 'DI Yogyakarta',
 kotaList: [
 { nama: 'Kota Yogyakarta', kecamatanList: [
 { nama: 'Gondokusuman', kelurahanList: ['Baciro', 'Demangan', 'Kotabaru', 'Klitren', 'Terban'] },
 { nama: 'Kraton', kelurahanList: ['Kadipaten', 'Panembahan', 'Patehan'] },
 { nama: 'Mergangsan', kelurahanList: ['Brontokusuman', 'Keparakan', 'Wirogunan'] },
 { nama: 'Umbulharjo', kelurahanList: ['Giwangan', 'Muja Muju', 'Pandeyan', 'Semaki', 'Sorosutan', 'Tahunan', 'Warungboto'] },
 { nama: 'Kotagede', kelurahanList: ['Purbayan', 'Prenggan', 'Rejowinangun'] },
 { nama: 'Jetis', kelurahanList: ['Bumijo', 'Cokrodiningratan', 'Gowongan'] },
 { nama: 'Tegalrejo', kelurahanList: ['Bener', 'Karangwaru', 'Kricak', 'Tegalrejo'] }
 ]},
 { nama: 'Kab. Sleman', kecamatanList: [
 { nama: 'Depok', kelurahanList: ['Caturtunggal', 'Condongcatur', 'Maguwoharjo'] },
 { nama: 'Gamping', kelurahanList: ['Ambarketawang', 'Banyuraden', 'Nogotirto', 'Trihanggo'] },
 { nama: 'Mlati', kelurahanList: ['Sendangadi', 'Sinduadi', 'Tirtoadi', 'Tlogoadi'] },
 { nama: 'Ngaglik', kelurahanList: ['Donoharjo', 'Minomartani', 'Sariharjo', 'Sardonoharjo', 'Sinduharjo', 'Sukoharjo'] },
 { nama: 'Sleman', kelurahanList: ['Caturharjo', 'Pandowoharjo', 'Tridadi', 'Triharjo', 'Trimulyo'] }
 ]},
 { nama: 'Kab. Bantul', kecamatanList: [
 { nama: 'Bantul', kelurahanList: ['Bantul', 'Palbapang', 'Ringinharjo', 'Trirenggo'] },
 { nama: 'Kasihan', kelurahanList: ['Bangunjiwo', 'Ngestiharjo', 'Tamantirto', 'Tirtonirmolo'] },
 { nama: 'Sewon', kelurahanList: ['Bangunharjo', 'Panggungharjo', 'Pendowoharjo', 'Timbulharjo'] }
 ]},
 { nama: 'Kab. Gunungkidul', kecamatanList: [
 { nama: 'Wonosari', kelurahanList: ['Baleharjo', 'Kepek', 'Piyaman', 'Siraman', 'Wonosari'] },
 { nama: 'Playen', kelurahanList: ['Bleberan', 'Dengok', 'Ngunut', 'Playen'] }
 ]},
 { nama: 'Kab. Kulon Progo', kecamatanList: [
 { nama: 'Wates', kelurahanList: ['Bendungan', 'Giripeni', 'Karangwuni', 'Ngestiharjo', 'Triharjo', 'Wates'] },
 { nama: 'Pengasih', kelurahanList: ['Kedungsari', 'Margosari', 'Pengasih', 'Sendangsari', 'Sidomulyo', 'Tawangsari'] }
 ]}
 ]
 },
 {
 provinsi: 'Jawa Timur',
 kotaList: [
 { nama: 'Kota Surabaya', kecamatanList: [
 { nama: 'Genteng', kelurahanList: ['Embong Kaliasin', 'Genteng', 'Kapasari', 'Kedungdoro', 'Ketabang', 'Peneleh'] },
 { nama: 'Gubeng', kelurahanList: ['Airlangga', 'Baratajaya', 'Gubeng', 'Kertajaya', 'Mojo', 'Pucang Sewu'] },
 { nama: 'Sukolilo', kelurahanList: ['Gebang Putih', 'Keputih', 'Klampis Ngasem', 'Medokan Semampir', 'Menur Pumpungan', 'Nginden Jangkungan', 'Semolowaru'] },
 { nama: 'Rungkut', kelurahanList: ['Gununganyar', 'Kalirungkut', 'Kedung Baruk', 'Medokan Ayu', 'Penjaringan Sari', 'Rungkut Kidul', 'Wonorejo'] },
 { nama: 'Tambaksari', kelurahanList: ['Dukuh Setro', 'Gading', 'Kapasmadya Baru', 'Kapasan', 'Pacar Keling', 'Pacar Kembang', 'Ploso', 'Tambak Rejo'] },
 { nama: 'Tegalsari', kelurahanList: ['Dr. Soetomo', 'Kedungdoro', 'Keputran', 'Tegalsari', 'Wonorejo'] },
 { nama: 'Wonokromo', kelurahanList: ['Darmo', 'Jagir', 'Ngagelrejo', 'Ngagel', 'Sawunggaling', 'Wonokromo'] }
 ]},
 { nama: 'Kota Malang', kecamatanList: [
 { nama: 'Klojen', kelurahanList: ['Bareng', 'Gadingkasri', 'Kasin', 'Kiduldalem', 'Klojen', 'Oro-Oro Dowo', 'Penanggungan', 'Rampal Celaket', 'Samaan', 'Sukoharjo'] },
 { nama: 'Lowokwaru', kelurahanList: ['Dinoyo', 'Jatimulyo', 'Lowokwaru', 'Merjosari', 'Mojolangu', 'Sumbersari', 'Tasikmadu', 'Tlogomas', 'Tulusrejo', 'Tunggulwulung', 'Tunjungsekar'] },
 { nama: 'Blimbing', kelurahanList: ['Arjosari', 'Blimbing', 'Bunulrejo', 'Jodipan', 'Kesatrian', 'Pandanwangi', 'Polowijen', 'Purwantoro', 'Purwodadi'] },
 { nama: 'Kedungkandang', kelurahanList: ['Arjowinangun', 'Bumiayu', 'Buring', 'Cemorokandang', 'Kedungkandang', 'Kotalama', 'Lesanpuro', 'Madyopuro', 'Mergosono', 'Sawojajar', 'Tlogowaru', 'Wonokoyo'] },
 { nama: 'Sukun', kelurahanList: ['Bakalan Krajan', 'Bandulan', 'Ciptomulyo', 'Gadang', 'Karang Besuki', 'Kebonsari', 'Mulyorejo', 'Pisang Candi', 'Sukun', 'Tanjungrejo'] }
 ]},
 { nama: 'Kota Batu', kecamatanList: [
 { nama: 'Batu', kelurahanList: ['Ngaglik', 'Oro-Oro Ombo', 'Pesanggrahan', 'Sisir', 'Songgokerto', 'Temas'] },
 { nama: 'Bumiaji', kelurahanList: ['Bulukerto', 'Bumiaji', 'Giripurno', 'Gunungsari', 'Pandanrejo', 'Punten', 'Sumber Brantas', 'Sumbergondo', 'Tulungrejo'] },
 { nama: 'Junrejo', kelurahanList: ['Beji', 'Dadaprejo', 'Junrejo', 'Mojorejo', 'Pendem', 'Tlekung', 'Torongrejo'] }
 ]},
 { nama: 'Kab. Sidoarjo', kecamatanList: [
 { nama: 'Sidoarjo', kelurahanList: ['Bluru Kidul', 'Celep', 'Gebang', 'Jati', 'Kemiri', 'Lemah Putro', 'Magersari', 'Pekauman', 'Pucang', 'Sarirogo', 'Sekardangan', 'Sidoklumpuk', 'Sidokumpul', 'Sumput', 'Urangagung'] },
 { nama: 'Waru', kelurahanList: ['Bungurasih', 'Janti', 'Kepuh Kiriman', 'Kedungrejo', 'Medaeng', 'Pepelegi', 'Tambak Oso', 'Tambak Rejo', 'Tambak Sawah', 'Tambak Sumur', 'Tropodo', 'Wadungasri', 'Waru'] },
 { nama: 'Gedangan', kelurahanList: ['Gedangan', 'Ganting', 'Keboansikep', 'Ketajen', 'Kragan', 'Punggul', 'Semambung', 'Sruni', 'Tebel', 'Wedi'] }
 ]},
 { nama: 'Kab. Gresik', kecamatanList: [
 { nama: 'Gresik', kelurahanList: ['Bedilan', 'Gapurosukolilo', 'Karangpoh', 'Kebungson', 'Kemuteran', 'Kroman', 'Lumpur', 'Pekelingan', 'Pekauman', 'Setingi', 'Sidokumpul', 'Sukodono', 'Tlogopojok', 'Trate'] },
 { nama: 'Kebomas', kelurahanList: ['Dahanrejo', 'Gending', 'Giri', 'Gulomantung', 'Indro', 'Kambangan', 'Karangkering', 'Kedanyang', 'Ngargosari', 'Prambangan', 'Randuagung', 'Segoromadu', 'Sidomoro', 'Singorejo', 'Sukorame', 'Tenggulunan'] }
 ]}
 ]
 },
 {
 provinsi: 'Bali',
 kotaList: [
 { nama: 'Kota Denpasar', kecamatanList: [
 { nama: 'Denpasar Barat', kelurahanList: ['Dauh Puri', 'Dauh Puri Kaja', 'Dauh Puri Kangin', 'Dauh Puri Kauh', 'Dauh Puri Kelod', 'Padangsambian', 'Padangsambian Kaja', 'Padangsambian Kelod', 'Pemecutan', 'Pemecutan Kaja', 'Pemecutan Kelod'] },
 { nama: 'Denpasar Selatan', kelurahanList: ['Panjer', 'Pedungan', 'Renon', 'Sanur', 'Sanur Kaja', 'Sanur Kauh', 'Sesetan', 'Sidakarya'] },
 { nama: 'Denpasar Timur', kelurahanList: ['Dangin Puri', 'Dangin Puri Kaja', 'Dangin Puri Kangin', 'Dangin Puri Kauh', 'Dangin Puri Kelod', 'Kesiman', 'Kesiman Kertalangu', 'Kesiman Petilan', 'Penatih', 'Sumerta', 'Sumerta Kaja', 'Sumerta Kauh', 'Sumerta Kelod'] },
 { nama: 'Denpasar Utara', kelurahanList: ['Dauh Puri', 'Peguyangan', 'Peguyangan Kaja', 'Peguyangan Kangin', 'Pemecutan Kaja', 'Tonja', 'Ubung', 'Ubung Kaja'] }
 ]},
 { nama: 'Kab. Badung', kecamatanList: [
 { nama: 'Kuta', kelurahanList: ['Kuta', 'Legian', 'Seminyak', 'Tuban'] },
 { nama: 'Kuta Selatan', kelurahanList: ['Benoa', 'Jimbaran', 'Kutuh', 'Pecatu', 'Tanjung Benoa', 'Ungasan'] },
 { nama: 'Kuta Utara', kelurahanList: ['Canggu', 'Dalung', 'Kerobokan', 'Kerobokan Kaja', 'Kerobokan Kelod', 'Tibubeneng'] },
 { nama: 'Mengwi', kelurahanList: ['Abianbase', 'Baha', 'Gulingan', 'Kapal', 'Mengwi', 'Munggu', 'Sempidi', 'Sading'] }
 ]},
 { nama: 'Kab. Gianyar', kecamatanList: [
 { nama: 'Ubud', kelurahanList: ['Kedewatan', 'Lodtunduh', 'Mas', 'Peliatan', 'Petulu', 'Sayan', 'Singakerta', 'Ubud'] },
 { nama: 'Gianyar', kelurahanList: ['Bitera', 'Gianyar', 'Samplangan', 'Sidan', 'Sumerta'] },
 { nama: 'Sukawati', kelurahanList: ['Batuan', 'Batubulan', 'Celuk', 'Kemenuh', 'Singapadu', 'Sukawati'] }
 ]}
 ]
 },
 {
 provinsi: 'Nusa Tenggara Barat (NTB)',
 kotaList: [
 { nama: 'Kota Mataram', kecamatanList: [
 { nama: 'Ampenan', kelurahanList: ['Ampenan Selatan', 'Ampenan Tengah', 'Ampenan Utara', 'Bintaro', 'Dayan Peken', 'Kebon Sari', 'Pejarakan Karya', 'Taman Sari'] },
 { nama: 'Cakranegara', kelurahanList: ['Cakranegara Barat', 'Cakranegara Selatan', 'Cakranegara Selatan Baru', 'Cakranegara Timur', 'Cakranegara Utara', 'Cilinaya', 'Karang Taliwang', 'Mayura', 'Sapta Marga', 'Sayang Sayang'] },
 { nama: 'Mataram', kelurahanList: ['Mataram Barat', 'Mataram Timur', 'Pagutan', 'Pagutan Barat', 'Pejanggik', 'Pagesangan', 'Punia'] },
 { nama: 'Sekarbela', kelurahanList: ['Jempong Baru', 'Karang Pule', 'Kekalik Jaya', 'Tanjung Karang', 'Tanjung Karang Permai'] },
 { nama: 'Selaparang', kelurahanList: ['Dasan Agung', 'Dasan Agung Baru', 'Gomong', 'Karang Baru', 'Monjok', 'Monjok Barat', 'Monjok Timur', 'Rembiga'] }
 ]},
 { nama: 'Kota Bima', kecamatanList: [
 { nama: 'Raba', kelurahanList: ['Kendo', 'Nae', 'Ntobo', 'Penatoi', 'Rite', 'Rontu'] },
 { nama: 'Rasanae Barat', kelurahanList: ['Dara', 'Na_e', 'Pane', 'Paruga', 'Sarae', 'Tanjung'] }
 ]}
 ]
 },
 {
 provinsi: 'Nusa Tenggara Timur (NTT)',
 kotaList: [
 { nama: 'Kota Kupang', kecamatanList: [
 { nama: 'Oebobo', kelurahanList: ['Fatululi', 'Kayu Putih', 'Liliba', 'Oebufu', 'Oebobo', 'Oetete', 'TDM'] },
 { nama: 'Kota Raja', kelurahanList: ['Airnona', 'Bakunase', 'Bakunase II', 'Fontein', 'Kuanino', 'Naikoten I', 'Naikoten II', 'Nunleu'] },
 { nama: 'Kelapa Lima', kelurahanList: ['Kelapa Lima', 'Lasiana', 'Oesapa', 'Oesapa Barat', 'Oesapa Selatan'] }
 ]},
 { nama: 'Kab. Manggarai Barat', kecamatanList: [
 { nama: 'Komodo', kelurahanList: ['Gorontalo', 'Labuan Bajo', 'Wae Kelambu'] },
 { nama: 'Labuan Bajo', kelurahanList: ['Batu Cermin', 'Labuan Bajo', 'Wae Bo'] }
 ]}
 ]
 },
 {
 provinsi: 'Kalimantan Barat',
 kotaList: [
 { nama: 'Kota Pontianak', kecamatanList: [
 { nama: 'Pontianak Kota', kelurahanList: ['Darat Sekip', 'Dalam Bugis', 'Mariana', 'Sungai Bangkong', 'Sungai Jawi', 'Tengah'] },
 { nama: 'Pontianak Selatan', kelurahanList: ['Akcaya', 'Bansir Darat', 'Bansir Laut', 'Kota Baru', 'Parit Tokaya'] },
 { nama: 'Pontianak Utara', kelurahanList: ['Batulayang', 'Siantan Hilir', 'Siantan Hulu', 'Siantan Tengah'] }
 ]},
 { nama: 'Kota Singkawang', kecamatanList: [
 { nama: 'Singkawang Barat', kelurahanList: ['Kuala', 'Melayu', 'Pasiran', 'Sungai Bulan'] },
 { nama: 'Singkawang Tengah', kelurahanList: ['Condong', 'Jawa', 'Melayu Baru', 'Roban'] }
 ]}
 ]
 },
 {
 provinsi: 'Kalimantan Selatan',
 kotaList: [
 { nama: 'Kota Banjarmasin', kecamatanList: [
 { nama: 'Banjarmasin Tengah', kelurahanList: ['Antasan Besar', 'Gadang', 'Kertak Baru Ilir', 'Kertak Baru Ulu', 'Mawar', 'Melayu', 'Seberang Mesjid', 'Sungai Baru', 'Teluk Dalam', 'Teluk Tiram'] },
 { nama: 'Banjarmasin Selatan', kelurahanList: ['Basirih', 'Kelayan Barat', 'Kelayan Dalam', 'Kelayan Luar', 'Kelayan Selatan', 'Kelayan Tengah', 'Kelayan Timur', 'Mantuil', 'Murung Raya', 'Pekapuran Raya', 'Pemurus Baru', 'Pemurus Dalam', 'Pemurus Luar', 'Tanjung Pagar'] },
 { nama: 'Banjarmasin Barat', kelurahanList: ['Belitung Selatan', 'Belitung Utara', 'Kuin Cerucuk', 'Kuin Selatan', 'Pelambuan', 'Telaga Biru', 'Telawang'] },
 { nama: 'Banjarmasin Utara', kelurahanList: ['Alalak Selatan', 'Alalak Tengah', 'Alalak Utara', 'Kuin Utara', 'Pangeran', 'Surgi Mufti', 'Sungai Jingah', 'Sungai Miai'] },
 { nama: 'Banjarmasin Timur', kelurahanList: ['Karang Mekar', 'Kuripan', 'Pekapuran Laut', 'Pengambangan', 'Sungai Bilu', 'Sungai Lulut'] }
 ]},
 { nama: 'Kota Banjarbaru', kecamatanList: [
 { nama: 'Banjarbaru Selatan', kelurahanList: ['Guntung Manggis', 'Kemuning', 'Landasan Ulin Selatan', 'Loktabat Selatan', 'Sungai Besar'] },
 { nama: 'Banjarbaru Utara', kelurahanList: ['Komet', 'Loktabat Utara', 'Mentaos', 'Sungai Ulin'] },
 { nama: 'Landasan Ulin', kelurahanList: ['Guntung Payung', 'Landasan Ulin Barat', 'Landasan Ulin Timur', 'Landasan Ulin Utara', 'Syamsudin Noor'] }
 ]}
 ]
 },
 {
 provinsi: 'Kalimantan Timur',
 kotaList: [
 { nama: 'Kota Samarinda', kecamatanList: [
 { nama: 'Samarinda Kota', kelurahanList: ['Bugis', 'Karang Mumus', 'Pelabuhan', 'Sungai Pinang Dalam'] },
 { nama: 'Samarinda Ulu', kelurahanList: ['Air Hitam', 'Air Putih', 'Bukit Pinang', 'Dadi Mulya', 'Gunung Kelua', 'Jawa', 'Sidodadi', 'Teluk Lerong Ulu'] },
 { nama: 'Samarinda Ilir', kelurahanList: ['Pelita', 'Selor', 'Sidomulyo', 'Sungai Dama', 'Teluk Lerong Ilir'] }
 ]},
 { nama: 'Kota Balikpapan', kecamatanList: [
 { nama: 'Balikpapan Kota', kelurahanList: ['Damai', 'Klandasan Ilir', 'Klandasan Ulu', 'Prapatan', 'Telaga Sari'] },
 { nama: 'Balikpapan Selatan', kelurahanList: ['Damai Baru', 'Damai Bahagia', 'Gunung Bahagia', 'Sepinggan', 'Sepinggan Baru', 'Sepinggan Raya', 'Sumber Rejo'] },
 { nama: 'Balikpapan Utara', kelurahanList: ['Batu Ampar', 'Graha Indah', 'Gunung Samarinda', 'Gunung Samarinda Baru', 'Karang Joang', 'Muara Rapak'] }
 ]}
 ]
 },
 {
 provinsi: 'Kalimantan Tengah',
 kotaList: [
 { nama: 'Kota Palangka Raya', kecamatanList: [
 { nama: 'Jekan Raya', kelurahanList: ['Bukit Tunggal', 'Menteng', 'Palangka', 'Petuk Katimpun'] },
 { nama: 'Pahandut', kelurahanList: ['Langkai', 'Pahandut', 'Panarung', 'Tanjung Pinang', 'Tumbang Rungan'] }
 ]}
 ]
 },
 {
 provinsi: 'Kalimantan Utara',
 kotaList: [
 { nama: 'Kota Tarakan', kecamatanList: [
 { nama: 'Tarakan Barat', kelurahanList: ['Karang Anyar', 'Karang Anyar Pantai', 'Karang Balik', 'Karang Rejo', 'Selumit', 'Selumit Pantai'] },
 { nama: 'Tarakan Tengah', kelurahanList: ['Kampung Satu/Skip', 'Pamusian', 'Sebengkok', 'Selumit'] },
 { nama: 'Tarakan Timur', kelurahanList: ['Gunung Lingkas', 'Lingkas Ujung', 'Mamburungan'] }
 ]}
 ]
 },
 {
 provinsi: 'Sulawesi Utara',
 kotaList: [
 { nama: 'Kota Manado', kecamatanList: [
 { nama: 'Wenang', kelurahanList: ['Bumi Beringin', 'Calaca', 'Istiqlal', 'Komo Luar', 'Lawangirung', 'Mahakeret Barat', 'Mahakeret Timur', 'Pinaesaan', 'Teling Atas', 'Tikala Ares', 'Wenang Selatan', 'Wenang Utara'] },
 { nama: 'Sario', kelurahanList: ['Ranotana', 'Ranotana Weru', 'Sario', 'Sario Kotabaru', 'Sario Tumpaan', 'Sario Utara', 'Titiwungen Selatan', 'Titiwungen Utara'] },
 { nama: 'Malalayang', kelurahanList: ['Bahu', 'Kleak', 'Malalayang Dua', 'Malalayang Satu', 'Winangun Atas', 'Winangun Dua'] }
 ]}
 ]
 },
 {
 provinsi: 'Sulawesi Selatan',
 kotaList: [
 { nama: 'Kota Makassar', kecamatanList: [
 { nama: 'Makassar', kelurahanList: ['Bara-Baraya', 'Bara-Baraya Selatan', 'Bara-Baraya Timur', 'Bara-Baraya Utara', 'Barana', 'Lariang Bangi', 'Maccini', 'Maccini Gusung', 'Maccini Parang', 'Mardekaya', 'Mardekaya Selatan', 'Mardekaya Utara', 'Maricaya', 'Maricaya Baru'] },
 { nama: 'Panakkukang', kelurahanList: ['Karampuang', 'Karuwisi', 'Karuwisi Utara', 'Masale', 'Pampang', 'Panaikang', 'Paropo', 'Sinrijala', 'Tamamaung', 'Tello Baru'] },
 { nama: 'Tamalate', kelurahanList: ['Balang Baru', 'Bontoduri', 'BontoMakkio', 'Jongaya', 'Kampung Manggarai', 'Mannuruki', 'Pa\'Baeng-Baeng', 'Parang Tambung'] },
 { nama: 'Rappocini', kelurahanList: ['Balla Parang', 'Banta-Bantaeng', 'Bonto Makkio', 'Buakana', 'Kassi-Kassi', 'Rappocini', 'Tidung'] }
 ]},
 { nama: 'Kota Parepare', kecamatanList: [
 { nama: 'Ujung', kelurahanList: ['Labukkang', 'Lakessi', 'Mallusetasi', 'Ujung Baru', 'Ujung Sabbang'] },
 { nama: 'Soreang', kelurahanList: ['Bukit Harapan', 'Bukit Indah', 'Kampung Baru', 'Lakessi', 'Ujung Bulu', 'Ujung Lare', 'Watang Soreang'] }
 ]}
 ]
 },
 {
 provinsi: 'Sulawesi Tengah',
 kotaList: [
 { nama: 'Kota Palu', kecamatanList: [
 { nama: 'Palu Barat', kelurahanList: ['Balaroa', 'Donggala Kodi', 'Kabonena', 'Kamonji', 'Lere', 'Silae', 'Ujuna'] },
 { nama: 'Palu Timur', kelurahanList: ['Besusu Barat', 'Besusu Tengah', 'Besusu Timur', 'Lolu Selatan', 'Lolu Utara'] },
 { nama: 'Palu Selatan', kelurahanList: ['Birobuli Selatan', 'Birobuli Utara', 'Petobo', 'Tatura Selatan', 'Tatura Utara'] }
 ]}
 ]
 },
 {
 provinsi: 'Sulawesi Tenggara',
 kotaList: [
 { nama: 'Kota Kendari', kecamatanList: [
 { nama: 'Kendari', kelurahanList: ['Kandai', 'Kendari Caddi', 'Mangga Dua', 'Purirano'] },
 { nama: 'Mandonga', kelurahanList: ['Alolama', 'Anggilowu', 'Korumba', 'Mandonga', 'Wawombalata'] },
 { nama: 'Poasia', kelurahanList: ['Anduonohu', 'Anggoeya', 'Matabubu', 'Rahandouna'] }
 ]}
 ]
 },
 {
 provinsi: 'Gorontalo',
 kotaList: [
 { nama: 'Kota Gorontalo', kecamatanList: [
 { nama: 'Kota Selatan', kelurahanList: ['Biawao', 'Biawu', 'Limba B', 'Limba U I', 'Limba U II'] },
 { nama: 'Kota Timur', kelurahanList: ['Heledulaa Selatan', 'Heledulaa', 'Ipilo', 'Padebuolo', 'Tamalate'] },
 { nama: 'Dungingi', kelurahanList: ['Huangobotu', 'Libuo', 'Tomulabutao', 'Tomulabutao Selatan', 'Tuladenggi'] }
 ]}
 ]
 },
 {
 provinsi: 'Sulawesi Barat',
 kotaList: [
 { nama: 'Kab. Mamuju', kecamatanList: [
 { nama: 'Mamuju', kelurahanList: ['Binanga', 'Karema', 'Mamunyu', 'Rimuku', 'Simboro'] }
 ]},
 { nama: 'Kab. Polewali Mandar', kecamatanList: [
 { nama: 'Polewali', kelurahanList: ['Darma', 'Madatte', 'Manding', 'Pekkabata', 'Polewali', 'Takatidung', 'Wattang'] }
 ]}
 ]
 },
 {
 provinsi: 'Maluku',
 kotaList: [
 { nama: 'Kota Ambon', kecamatanList: [
 { nama: 'Sirimau', kelurahanList: ['Ahusen', 'Amantelu', 'Batu Gajah', 'Batu Meja', 'Galala', 'Hative Kecil', 'Honipopu', 'Karang Panjang', 'Rijali', 'Uritetu', 'Waihaong'] },
 { nama: 'Nusaniwe', kelurahanList: ['Airsalobar', 'Benteng', 'Kudamati', 'Mangga Dua', 'Nusaniwe', 'Wainitu'] },
 { nama: 'Teluk Ambon', kelurahanList: ['Hative Besar', 'Hunuth / Durian Patah', 'Latta', 'Poka', 'Rumah Tiga', 'Wayame'] }
 ]},
 { nama: 'Kota Tual', kecamatanList: [
 { nama: 'Pulau Dullah Selatan', kelurahanList: ['El Rahab', 'Fiditan', 'Langgur', 'Ohoijang', 'Ohoiren'] },
 { nama: 'Pulau Dullah Utara', kelurahanList: ['Dullah', 'Fiditan', 'Tual'] }
 ]}
 ]
 },
 {
 provinsi: 'Maluku Utara',
 kotaList: [
 { nama: 'Kota Ternate', kecamatanList: [
 { nama: 'Ternate Tengah', kelurahanList: ['Gamalama', 'Kalumpang', 'Makassar Barat', 'Makassar Timur', 'Maliaro', 'Muhajirin', 'Salahuddin', 'Santiong', 'Tanah Raja'] },
 { nama: 'Ternate Selatan', kelurahanList: ['Bastiong Karance', 'Bastiong Talangame', 'Fajardusfa', 'Jati', 'Jati Perumnas', 'Kayu Merah', 'Mangga Dua', 'Mangga Dua Utara', 'Ngade', 'Sasa', 'Tabona', 'Toboko', 'Ubo-Ubo'] },
 { nama: 'Ternate Utara', kelurahanList: ['Akehuda', 'Dufa-Dufa', 'Sangaji', 'Sangaji Utara', 'Sango', 'Soasio', 'Tabam', 'Tobololo', 'Tafure'] },
 { nama: 'Ternate Barat', kelurahanList: ['Dorpedu', 'Jambula', 'Kastela', 'Sulamadaha', 'Takome', 'Togafo'] }
 ]},
 { nama: 'Kota Tidore Kepulauan', kecamatanList: [
 { nama: 'Tidore', kelurahanList: ['Gamtufkange', 'Gurabunga', 'Indonesiana', 'Soa', 'Soa Sio', 'Topo', 'Topo Tiga'] },
 { nama: 'Tidore Selatan', kelurahanList: ['Gurabati', 'Mare', 'Maitara', 'Rum', 'Tongowai'] },
 { nama: 'Tidore Utara', kelurahanList: ['Afa Afa', 'Dowora', 'Loleo', 'Mareku', 'Mafututu', 'Tongowai'] }
 ]}
 ]
 },
 {
 provinsi: 'Papua',
 kotaList: [
 { nama: 'Kota Jayapura', kecamatanList: [
 { nama: 'Jayapura Selatan', kelurahanList: ['Argapura', 'Ardipura', 'Entrop', 'Hamadi', 'Numbay', 'Vim'] },
 { nama: 'Jayapura Utara', kelurahanList: ['Angkasapura', 'Bhayangkara', 'Gurabesi', 'Mandala', 'Tanjung Ria'] },
 { nama: 'Abepura', kelurahanList: ['Asano', 'Awiyo', 'Kota Baru', 'Vim', 'Wahno', 'Yobe'] }
 ]},
 { nama: 'Kab. Jayapura', kecamatanList: [
 { nama: 'Sentani', kelurahanList: ['Dobonsolo', 'Hinekombe', 'Hobong', 'Ifar Besar', 'Sentani Kota', 'Yahim'] }
 ]}
 ]
 },
 {
 provinsi: 'Papua Barat',
 kotaList: [
 { nama: 'Kab. Manokwari', kecamatanList: [
 { nama: 'Manokwari Barat', kelurahanList: ['Amban', 'Manokwari Barat', 'Padarni', 'Sanggeng', 'Wosi'] },
 { nama: 'Manokwari Timur', kelurahanList: ['Aipiri', 'Fanindi', 'Manokwari Timur', 'Pasir Putih'] }
 ]}
 ]
 },
 {
 provinsi: 'Papua Barat Daya',
 kotaList: [
 { nama: 'Kota Sorong', kecamatanList: [
 { nama: 'Sorong', kelurahanList: ['Klademak', 'Klasaman', 'Malaingkedi', 'Remu Utara'] },
 { nama: 'Sorong Barat', kelurahanList: ['Klablim', 'Rufei', 'Tampa Garam'] },
 { nama: 'Sorong Timur', kelurahanList: ['Kampung Baru', 'Klasabi', 'Klawuyuk'] }
 ]}
 ]
 },
 {
 provinsi: 'Papua Tengah',
 kotaList: [
 { nama: 'Kab. Mimika', kecamatanList: [
 { nama: 'Mimika Baru', kelurahanList: ['Kwamki Narama', 'Otomona', 'Timika Jaya'] },
 { nama: 'Timika', kelurahanList: ['Koperapoka', 'Nawaripi', 'Timika'] }
 ]},
 { nama: 'Kab. Nabire', kecamatanList: [
 { nama: 'Nabire', kelurahanList: ['Karang Mulia', 'Kalibobo', 'Nabire Barat', 'Nabire Kota', 'Oyehe'] }
 ]}
 ]
 },
 {
 provinsi: 'Papua Selatan',
 kotaList: [
 { nama: 'Kab. Merauke', kecamatanList: [
 { nama: 'Merauke', kelurahanList: ['Bambu Pemda', 'Karang Indah', 'Kelapa Lima', 'Mandala', 'Maro', 'Rimba Jaya', 'Seringgu Jaya'] }
 ]}
 ]
 },
 {
 provinsi: 'Papua Pegunungan',
 kotaList: [
 { nama: 'Kab. Jayawijaya', kecamatanList: [
 { nama: 'Wamena', kelurahanList: ['Hom-Hom', 'Honai Lama', 'Ilekma', 'Sinakma', 'Wamena Kota'] }
 ]}
 ]
 }
]

// ── Helper Functions ──

/** Get list of all provinsi */
export const getProvinsiList = () => WILAYAH_DATA.map(w => w.provinsi)

/** Get list of kota for a given provinsi. If no prov given, return all kota. */
export const getKotaOptions = (provName) => {
 if (!provName) {
 return WILAYAH_DATA.flatMap(p => p.kotaList.map(k => k.nama))
 }
 const foundProv = WILAYAH_DATA.find(p => p.provinsi.toLowerCase() === provName.toLowerCase())
 return foundProv ? foundProv.kotaList.map(k => k.nama) : []
}

/** Get list of kecamatan for a given kota. */
export const getKecamatanOptions = (kotaName) => {
 if (!kotaName) return []
 const clean = (s) => (s || '').toLowerCase().replace(/^(kota|kab\.|kabupaten)\s+/i, '').trim()
 const target = clean(kotaName)
 for (const prov of WILAYAH_DATA) {
 const foundKota = prov.kotaList.find(k => k.nama.toLowerCase() === kotaName.toLowerCase() || clean(k.nama) === target)
 if (foundKota && foundKota.kecamatanList) {
 return foundKota.kecamatanList.map(kec => kec.nama)
 }
 }
 return []
}

/** Get list of kelurahan for a given kecamatan. */
export const getKelurahanOptions = (kecName) => {
 if (!kecName) return []
 const clean = (s) => (s || '').toLowerCase().replace(/^(kec\.|kecamatan)\s+/i, '').trim()
 const target = clean(kecName)
 for (const prov of WILAYAH_DATA) {
 for (const kota of prov.kotaList) {
 if (!kota.kecamatanList) continue
 const foundKec = kota.kecamatanList.find(k => k.nama.toLowerCase() === kecName.toLowerCase() || clean(k.nama) === target)
 if (foundKec) {
 return foundKec.kelurahanList || []
 }
 }
 }
 return []
}

/** Get all kota/kabupaten for birth place dropdown. Includes current value if not found in list. */
export const getBirthPlaceOptions = (currentVal) => {
 const list = WILAYAH_DATA.flatMap(p => p.kotaList.map(k => k.nama))
 if (currentVal && !list.includes(currentVal)) {
 return [currentVal, ...list]
 }
 return list
}

export default WILAYAH_DATA
