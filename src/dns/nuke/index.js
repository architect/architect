module.exports = function nukeDNS(parms, callback) {
  // read .arc
  // delete associated domainnames and mappings
  if (process.env.ARC_NUKE === 'route53') {
    console.log('destroying nameservers, cert verification cname record and alias records')
  }
  else {
    console.log('deleting domainNames and basepathmappings')
  }
  callback()
}
