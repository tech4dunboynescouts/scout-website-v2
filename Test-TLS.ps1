function Test-TlsAlpn {
    param([string]$HostName)

    $tcp = $null
    $ssl = $null

    try {
        $tcp = [System.Net.Sockets.TcpClient]::new()
        $tcp.Connect($HostName, 443)

        $ssl = [System.Net.Security.SslStream]::new(
            $tcp.GetStream(),
            $false
        )

        $protocols =
            [System.Collections.Generic.List[
                System.Net.Security.SslApplicationProtocol
            ]]::new()

        $protocols.Add(
            [System.Net.Security.SslApplicationProtocol]::Http2
        )

        $protocols.Add(
            [System.Net.Security.SslApplicationProtocol]::Http11
        )

        $options =
            [System.Net.Security.SslClientAuthenticationOptions]::new()

        $options.TargetHost = $HostName
        $options.ApplicationProtocols = $protocols

        $ssl.AuthenticateAsClient($options)

        [pscustomobject]@{
            Host    = $HostName
            Result  = "SUCCESS"
            ALPN    = $ssl.NegotiatedApplicationProtocol.ToString()
            TLS     = $ssl.SslProtocol
            Subject = $ssl.RemoteCertificate.Subject
            Issuer  = $ssl.RemoteCertificate.Issuer
        }
    }
    catch {
        [pscustomobject]@{
            Host    = $HostName
            Result  = "FAILED"
            ALPN    = ""
            TLS     = ""
            Subject = ""
            Issuer  = ""
            Error   = $_.Exception.InnerException.Message
        }
    }
    finally {
        if ($ssl) { $ssl.Dispose() }
        if ($tcp) { $tcp.Dispose() }
    }
}

Test-TlsAlpn "z6no9y1q.api.sanity.io"
Test-TlsAlpn "www.google.com"