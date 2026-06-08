package device

import (
	"math/rand"
	"time"

	"github.com/arslab/lwnsimulator/simulator/util"

	act "github.com/arslab/lwnsimulator/simulator/components/device/activation"
	"github.com/arslab/lwnsimulator/simulator/components/device/classes"
	dl "github.com/arslab/lwnsimulator/simulator/components/device/frames/downlink"
	"github.com/brocaar/lorawan"
)

const (
	JOINACCEPTDELAY1 = time.Duration(5 * time.Second)
	JOINACCEPTDELAY2 = time.Duration(6 * time.Second)
)

func (d *Device) OtaaActivation() bool {

	for !d.Info.Status.Joined {

		d.Info.Status.Mode = util.Activation

		if !d.CanExecute() { //stop simulator
			return false
		}

		d.SwitchClass(classes.ClassA)

		d.SendJoinRequest()

		d.Print("Open RXs", nil, util.PrintBoth)

		receivedDownlink := false
		ignoredDownlinks := 0
		joinDelays := []time.Duration{JOINACCEPTDELAY1, JOINACCEPTDELAY2}
		for windowIndex, joinDelay := range joinDelays {
			for _, phy := range d.receiveJoinAcceptCandidates(windowIndex, joinDelay) {
				receivedDownlink = true
				d.Print("Downlink received", nil, util.PrintBoth)

				_, err := d.ProcessDownlink(*phy)
				if err == nil {
					break
				}

				ignoredDownlinks++
			}

			if d.Info.Status.Joined {
				break
			}
		}

		if !receivedDownlink {
			d.Print("None downlink received", nil, util.PrintBoth)
		} else if !d.Info.Status.Joined && ignoredDownlinks > 0 {
			d.Print("Ignored invalid downlinks", nil, util.PrintBoth)
		}

		if d.Info.Status.Joined {

			d.Print("Joined", nil, util.PrintBoth)
			d.Info.Status.Mode = util.Normal

			return true
		}

		d.Print("Unjoined", nil, util.PrintBoth)

		retryDelay := d.Info.Configuration.SendInterval
		if retryDelay <= 0 {
			retryDelay = 10 * time.Second
		}
		retryJitter := time.Duration(rand.Intn(3000)) * time.Millisecond
		retryTimer := time.NewTimer(retryDelay + retryJitter)

		select {
		case <-retryTimer.C:
		case <-d.Exit:
			retryTimer.Stop()
			d.Print("Turn OFF", nil, util.PrintBoth)
			return false
		}

	}

	return true
}

func (d *Device) receiveJoinAcceptCandidates(windowIndex int, delay time.Duration) []*lorawan.PHYPayload {

	if windowIndex >= len(d.Info.RX) {
		return nil
	}

	d.Info.Forwarder.Register(d.Info.RX[windowIndex].GetListeningFrequency(), d.Info.DevEUI, &d.Info.ReceivedDownlink)

	downlinks := d.Info.RX[windowIndex].OpenWindowAll(delay, &d.Info.ReceivedDownlink)

	d.Info.Forwarder.UnRegister(d.Info.RX[windowIndex].GetListeningFrequency(), d.Info.DevEUI)

	return downlinks

}

func (d *Device) CreateJoinRequest() []byte {

	rand.Seed(time.Now().UTC().UnixNano())
	random := uint16(rand.Int())

	DevNonce := lorawan.DevNonce(random)
	d.Info.DevNonce = DevNonce

	phy := lorawan.PHYPayload{
		MHDR: lorawan.MHDR{
			MType: lorawan.JoinRequest,
			Major: lorawan.LoRaWANR1,
		},
		MACPayload: &lorawan.JoinRequestPayload{
			JoinEUI:  d.Info.JoinEUI, // appEUI
			DevEUI:   d.Info.DevEUI,
			DevNonce: d.Info.DevNonce,
		},
	}

	if err := phy.SetUplinkJoinMIC(d.Info.AppKey); err != nil {

		d.Print("", err, util.PrintBoth)

		return []byte{}
	}

	bytes, err := phy.MarshalBinary()
	if err != nil {

		d.Print("", err, util.PrintBoth)

		return []byte{}
	}

	return bytes

}

func (d *Device) ProcessJoinAccept(JoinAccPayload *lorawan.JoinAcceptPayload) (*dl.InformationDownlink, error) {

	var downlink dl.InformationDownlink
	var err error

	//setkeys
	d.Info.NwkSKey, err = act.GetKey(JoinAccPayload.HomeNetID, JoinAccPayload.JoinNonce, d.Info.DevNonce, d.Info.AppKey, act.PadNwkSKey)
	if err != nil {
		return nil, err
	}

	d.Info.AppSKey, err = act.GetKey(JoinAccPayload.HomeNetID, JoinAccPayload.JoinNonce, d.Info.DevNonce, d.Info.AppKey, act.PadAppSKey)
	if err != nil {
		return nil, err
	}

	d.Info.Status.Joined = true

	//cflist
	if JoinAccPayload.CFList != nil {

		d.Print("Apply CFList", nil, util.PrintBoth)

		cflist, err := JoinAccPayload.CFList.Payload.MarshalBinary()
		if err != nil {
			return nil, err
		}

		if JoinAccPayload.CFList.CFListType == lorawan.CFListChannel { //list of channel

			var CFList lorawan.CFListChannelPayload

			err = CFList.UnmarshalBinary(false, cflist)
			if err != nil {
				return nil, err
			}

			for i, c := range CFList.Channels {
				index := i + d.Info.Configuration.Region.GetNbReservedChannels()
				d.setChannel(uint8(index), c, 0, 5)
			}

		} else { //list of ChMask

			var CFList lorawan.CFListChannelMaskPayload
			err = CFList.UnmarshalBinary(false, cflist)
			if err != nil {
				return nil, err
			}

			for i, mask := range CFList.ChannelMasks {

				for j, enable := range mask {

					index := j + i*16
					d.Info.Configuration.Channels[index].EnableUplink = enable

				}
			}

		}
	}

	d.Info.JoinNonce = JoinAccPayload.JoinNonce
	d.Info.DevAddr = JoinAccPayload.DevAddr
	d.Info.NetID = JoinAccPayload.HomeNetID

	Delay := 1000
	if JoinAccPayload.RXDelay != 0 {
		Delay = Delay * int(JoinAccPayload.RXDelay)
	}

	d.Info.RX[0].Delay = time.Duration(Delay) * time.Millisecond
	d.Info.RX[1].Delay = time.Duration(Delay) * time.Millisecond

	d.Info.Configuration.RX1DROffset = JoinAccPayload.DLSettings.RX1DROffset
	d.Info.RX[1].DataRate = JoinAccPayload.DLSettings.RX2DataRate
	downlink.MType = lorawan.JoinAccept

	return &downlink, nil
}
