const testLock = async () => {
  if (typeof window.bytom === 'undefined') {
    console.log("window.bytom is nil")
    return
  }
  let bytomAPI = new BytomAPI()
  let contract = `contract RevealPreimage(hash: Hash) locks valueAmount of valueAsset { clause reveal(string: String) { verify sha3(string) == hash unlock valueAmount of valueAsset } }`
  let args = ["d7190eb194ff9494625514b6d178c87f99c5973e28c398969d2233f2960a573e"]
  let ret = await bytomAPI.lock(0.03 * precision, 20000000, '3c3d007aef1644155f2bd81948cd8e0081ca06e3734356967c89373b55881794', contract, args).catch((err) => {
    console.log("lock err", err)
  })
  console.log("lock ret", ret)
}
