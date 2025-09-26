// build as Console App, target .NET Framework 4.7.2 or similar
using System;
using System.IO;
using System.Speech.Synthesis;

class TTSHelper
{
    static int Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("Usage: tts_helper \"text\" \"outpath.wav\"");
            return 1;
        }
        string text = args[0];
        string outPath = args[1];

        try
        {
            using (SpeechSynthesizer synth = new SpeechSynthesizer())
            {
                synth.SetOutputToWaveFile(outPath);
                synth.Speak(text);
            }
            return 0;
        }
        catch (Exception e)
        {
            Console.WriteLine("TTS error " + e.Message);
            return 2;
        }
    }
}
